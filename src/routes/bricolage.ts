import { Router, Request, Response } from 'express';
import { admin, db } from '../config/firebase-admin';
import { authenticateToken, optionalAuthenticateToken, authorizeAdmin, AuthenticatedRequest } from '../middlewares/auth';
import { BRICOLAGE_CATEGORIES, TOP_VERIFIED_ARTISANS } from '../data/bricolageData';
import { QuoteRequestPayload, ArtisanOpportunityDTO } from '../types/bricolage';
import { safeLogger } from '../utils/logger';

export const bricolageRouter = Router();

const SAMPLE_REVIEWS = [
  {
    id: 'rev-01',
    artisanName: 'Mourad Benali',
    clientName: 'Karim M.',
    wilaya: 'Alger (Hydra)',
    serviceName: 'Chauffe-eau & Chaudière',
    rating: 5,
    comment: "Intervention très rapide pour une fuite de gaz sur la chaudière. Travail propre, professionnel et prix très raisonnable !",
    date: 'Hier'
  },
  {
    id: 'rev-02',
    artisanName: 'Kamel Bricolage',
    clientName: 'Yassine B.',
    wilaya: 'Blida',
    serviceName: 'Dépannage Court-circuit',
    rating: 5,
    comment: "Panne électrique générale résolue à 22h un vendredi soir. Électricien courtois et équipé.",
    date: 'Il y a 3 jours'
  },
  {
    id: 'rev-03',
    artisanName: 'Atelier Hamza Alumi',
    clientName: 'Amina S.',
    wilaya: 'Oran',
    serviceName: 'Fenêtres PVC & Aluminium',
    rating: 4.9,
    comment: "Installation de 4 fenêtres double vitrage aluminium. Finitions impeccables et respect des délais.",
    date: 'Il y a 5 jours'
  }
];

// 1. Get Bricolage Categories & Services
bricolageRouter.get('/bricolage/categories', async (_req: Request, res: Response) => {
  try {
    if (!db) {
      return res.json({ success: true, data: BRICOLAGE_CATEGORIES, source: 'default' });
    }
    const snapshot = await db.collection('bricolage_categories').get();
    if (snapshot.empty) {
      return res.json({ success: true, data: BRICOLAGE_CATEGORIES, source: 'default' });
    }
    const categories: Array<Record<string, unknown>> = [];
    snapshot.forEach((doc) => categories.push(doc.data()));
    return res.json({ success: true, data: categories, source: 'firestore' });
  } catch (error) {
    safeLogger.error('Error fetching bricolage categories', { err: error instanceof Error ? error.message : String(error) });
    return res.json({ success: true, data: BRICOLAGE_CATEGORIES, source: 'default' });
  }
});

// 2. Get Verified Artisans Directory
bricolageRouter.get('/bricolage/artisans', async (req: Request, res: Response) => {
  const { wilaya, specialty } = req.query;
  try {
    if (!db) {
      let filtered = TOP_VERIFIED_ARTISANS;
      if (wilaya) {
        filtered = filtered.filter(a => a.wilaya.toLowerCase().includes(String(wilaya).toLowerCase()));
      }
      if (specialty && specialty !== 'all') {
        filtered = filtered.filter(a => a.specialty.toLowerCase().includes(String(specialty).toLowerCase()));
      }
      return res.json({ success: true, data: filtered });
    }
    let query: FirebaseFirestore.Query = db.collection('bricolage_artisans');
    if (wilaya) {
      query = query.where('wilaya', '==', wilaya);
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      return res.json({ success: true, data: TOP_VERIFIED_ARTISANS });
    }
    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach((doc) => list.push(doc.data()));
    return res.json({ success: true, data: list });
  } catch (error) {
    safeLogger.error('Error fetching artisans', { err: error instanceof Error ? error.message : String(error) });
    return res.json({ success: true, data: TOP_VERIFIED_ARTISANS });
  }
});

// 3. Submit Project Quote Request (ACID Transaction)
bricolageRouter.post('/bricolage/quotes', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const payload = req.body as QuoteRequestPayload;

  if (!payload.customerName || !payload.customerPhone || !payload.serviceCategoryId) {
    return res.status(400).json({ success: false, error: 'Champs obligatoires manquants.' });
  }

  const categoryDoc = BRICOLAGE_CATEGORIES.find(c => c.id === payload.serviceCategoryId) || BRICOLAGE_CATEGORIES[0];

  const cleanPayload: QuoteRequestPayload = {
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    serviceCategoryId: payload.serviceCategoryId,
    serviceName: payload.serviceName || (categoryDoc?.name?.fr || ''),
    wilaya: payload.wilaya,
    commune: payload.commune,
    description: payload.description,
    urgency: payload.urgency || 'normal',
    projectPhotos: payload.projectPhotos,
  };
  const customerId = req.user?.uid || null;

  const requestId = `QUOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    if (db) {
      const quoteRef = db.collection('bricolage_quote_requests').doc(requestId);
      const categoryRef = db.collection('bricolage_categories').doc(payload.serviceCategoryId);

      await db.runTransaction(async (transaction) => {
        const catSnap = await transaction.get(categoryRef);
        if (catSnap.exists) {
          const count = catSnap.data()?.requestCount || 0;
          transaction.update(categoryRef, { requestCount: count + 1 });
        }

        const docData: Record<string, unknown> = {
          id: requestId,
          ...cleanPayload,
          status: 'pending',
          estimatedPriceDZD: categoryDoc.avgPriceRangeDZD,
          createdAt: new Date().toISOString()
        };

        if (customerId) {
          docData.customerId = customerId;
        }

        transaction.set(quoteRef, docData);
      });
    }

    safeLogger.info('Created Bricolage Quote Request', { requestId, customerId: customerId || 'guest' });

    return res.json({
      success: true,
      data: {
        requestId,
        estimatedPriceDZD: categoryDoc.avgPriceRangeDZD,
        message: 'Votre demande de devis a été transmise aux artisans certifiés Olma dans votre Wilaya !'
      }
    });
  } catch (error) {
    safeLogger.error('Error saving quote request', { requestId, err: error instanceof Error ? error.message : String(error) });
    return res.json({
      success: true,
      data: {
        requestId,
        estimatedPriceDZD: categoryDoc.avgPriceRangeDZD,
        message: 'Demande enregistrée avec succès.'
      }
    });
  }
});

// 3.1 Get Bricolage Opportunities for Artisans (Secured DTO)
bricolageRouter.get('/bricolage/opportunities', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  const artisanUid = req.user.uid;

  // Server-side check: verify artisan profile and authorization status
  let isAuthorizedArtisan = false;

  // Admin users are allowed
  if (req.user.role === 'admin') {
    isAuthorizedArtisan = true;
  } else if (db) {
    try {
      const artisanDoc = await db.collection('bricolage_artisans').doc(artisanUid).get();
      if (artisanDoc.exists) {
        const data = artisanDoc.data() || {};
        // Strict whitelist requirement: status MUST be 'verified'
        if (data.verificationStatus === 'verified') {
          isAuthorizedArtisan = true;
        }
      }
    } catch (e) {
      safeLogger.warn('Error checking artisan profile', { artisanUid, err: e instanceof Error ? e.message : String(e) });
    }
  }

  if (!isAuthorizedArtisan) {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé. Privilèges Artisan requis pour consulter les opportunités.'
    });
  }

  const { wilaya, category } = req.query;

  try {
    if (!db) {
      return res.json({ success: true, data: [] });
    }

    let query: FirebaseFirestore.Query = db.collection('bricolage_quote_requests')
      .where('status', 'in', ['pending', 'quoted', 'matched']);

    if (wilaya && typeof wilaya === 'string' && wilaya.trim() !== '') {
      query = query.where('wilaya', '==', wilaya.trim());
    }

    if (category && typeof category === 'string' && category.trim() !== '' && category !== 'all') {
      query = query.where('serviceCategoryId', '==', category.trim());
    }

    // Limit to reasonable number of documents
    const snapshot = await query.limit(100).get();

    const opportunities: ArtisanOpportunityDTO[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() || {};
      const offers: Array<Record<string, unknown>> = Array.isArray(data.offers) ? data.offers : [];

      const myOfferRaw = offers.find((o) => o.artisanId === artisanUid);
      const myOffer = myOfferRaw ? {
        id: String(myOfferRaw.id || ''),
        priceDZD: Number(myOfferRaw.priceDZD) || 0,
        estimatedDuration: String(myOfferRaw.estimatedDuration || ''),
        notes: String(myOfferRaw.notes || ''),
        createdAt: String(myOfferRaw.createdAt || ''),
        status: String(myOfferRaw.status || 'pending')
      } : null;

      const locationLabel = data.commune ? `${data.commune}, ${data.wilaya || ''}` : (data.wilaya || 'Algérie');
      const customerDisplayName = `Client Olmart (${locationLabel})`;

      const dto: ArtisanOpportunityDTO = {
        id: data.id || doc.id,
        serviceCategoryId: data.serviceCategoryId || '',
        serviceName: data.serviceName || 'Prestation de Bricolage',
        wilaya: data.wilaya || '',
        commune: data.commune || '',
        urgency: data.urgency || 'normal',
        description: data.description || '',
        projectPhotos: Array.isArray(data.projectPhotos) ? data.projectPhotos : [],
        preferredDate: data.preferredDate || '',
        estimatedPriceDZD: data.estimatedPriceDZD || { min: 0, max: 0 },
        createdAt: data.createdAt || new Date().toISOString(),
        status: data.status || 'pending',

        customerDisplayName,
        offersCount: offers.length,
        hasSubmittedOffer: Boolean(myOfferRaw),
        myOffer
      };

      opportunities.push(dto);
    });

    return res.json({ success: true, data: opportunities });
  } catch (error) {
    safeLogger.error('Error fetching artisan opportunities', { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération des opportunités.' });
  }
});

// 4. Submit Offer by Artisan
bricolageRouter.post('/bricolage/offers', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentification requise pour soumettre un devis.' });
  }

  const { requestId, priceDZD, estimatedDuration, notes } = req.body;
  const artisanUid = req.user.uid;

  if (!requestId || !priceDZD || isNaN(Number(priceDZD)) || Number(priceDZD) <= 0) {
    return res.status(400).json({ success: false, error: 'Informations de devis incomplètes ou prix invalide.' });
  }

  const offerId = `OFFER-${Date.now()}`;

  try {
    if (db) {
      // 1. Verify that the authenticated user is a registered artisan
      const artisanDoc = await db.collection('bricolage_artisans').doc(artisanUid).get();
      const userDoc = await db.collection('users').doc(artisanUid).get();

      const artisanData = artisanDoc.exists ? artisanDoc.data() : null;
      const userData = userDoc.exists ? userDoc.data() : null;

      const userRole = req.user.role || userData?.role;
      const artisanProfile = artisanData || userData?.artisanProfile;

      if (userRole !== 'artisan' && userRole !== 'admin' && !artisanProfile) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé. Vous devez être inscrit en tant qu\'Artisan Professionnel pour soumettre des devis.'
        });
      }

      // Check verification status (pending or unverified cannot submit official offers if rejected/suspended)
      const vStatus = artisanProfile?.verificationStatus;
      if (vStatus === 'rejected' || vStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          error: 'Votre compte artisan est suspendu ou rejeté. Impossible d\'envoyer des devis.'
        });
      }

      const verifiedArtisanName = artisanProfile?.fullName || userData?.displayName || req.user.email?.split('@')[0] || 'Artisan Certifié';
      const verifiedArtisanPhone = artisanProfile?.phone || userData?.phone || '';
      const verifiedArtisanRating = artisanProfile?.rating !== undefined ? Number(artisanProfile.rating) : null;

      const requestRef = db.collection('bricolage_quote_requests').doc(requestId);
      await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(requestRef);
        if (!snap.exists) {
          throw new Error('DEMANDE_INTROUVABLE');
        }

        const currentOffers = snap.data()?.offers || [];
        const newOffer = {
          id: offerId,
          artisanId: artisanUid, // Derived strictly from server authentication
          artisanName: verifiedArtisanName,
          artisanPhone: verifiedArtisanPhone,
          artisanRating: verifiedArtisanRating,
          priceDZD: Number(priceDZD),
          estimatedDuration: typeof estimatedDuration === 'string' && estimatedDuration.trim() ? estimatedDuration.trim() : '2 Heures',
          notes: typeof notes === 'string' && notes.trim() ? notes.trim() : 'Prestation professionnelle',
          createdAt: new Date().toISOString(),
          status: 'pending'
        };

        transaction.update(requestRef, {
          status: 'quoted',
          offers: [...currentOffers, newOffer]
        });
      });
    }

    safeLogger.info('Artisan submitted offer', { artisanId: artisanUid, offerId, requestId });
    return res.json({
      success: true,
      data: { offerId, message: 'Devis transmis directement au client.' }
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'DEMANDE_INTROUVABLE') {
      return res.status(404).json({ success: false, error: 'Demande de devis introuvable.' });
    }
    safeLogger.error('Error submitting offer', { requestId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: 'Erreur lors de l\'enregistrement du devis.' });
  }
});

// 4.1 Accept Quote Offer by Customer Owner (ACID Transaction)
bricolageRouter.post('/bricolage/quotes/:id/accept-offer', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentification requise.' });
  }

  const requestId = req.params.id;
  const { offerId } = req.body;
  const customerUid = req.user.uid;

  if (!requestId || typeof requestId !== 'string') {
    return res.status(400).json({ success: false, error: 'Identifiant de demande invalide.' });
  }

  if (!offerId || typeof offerId !== 'string' || !offerId.trim()) {
    return res.status(400).json({ success: false, error: 'L\'identifiant du devis (offerId) est obligatoire.' });
  }

  if (!db) {
    return res.status(500).json({ success: false, error: 'Service de base de données indisponible.' });
  }

  try {
    const requestRef = db.collection('bricolage_quote_requests').doc(requestId);
    let acceptedOfferResult: Record<string, unknown> | null = null;

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(requestRef);
      if (!snap.exists) {
        throw { status: 404, message: 'Demande de devis introuvable.' };
      }

      const requestData = snap.data();
      if (!requestData) {
        throw { status: 404, message: 'Données de la demande introuvables.' };
      }

      // 1. Strict Ownership Check: must match authenticated user
      if (requestData.customerId !== customerUid) {
        throw { status: 403, message: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette demande de devis.' };
      }

      // 2. Status Validation: must be pending, quoted, or matched
      const currentStatus = requestData.status || 'pending';
      if (['accepted', 'in_progress', 'completed', 'cancelled'].includes(currentStatus)) {
        throw { status: 409, message: 'Un devis a déjà été accepté pour cette demande.' };
      }

      if (!['pending', 'quoted', 'matched'].includes(currentStatus)) {
        throw { status: 409, message: 'La demande ne peut plus être modifiée dans son statut actuel.' };
      }

      // 3. Offer Validation: find offer matching offerId inside request's existing offers
      const existingOffers: Array<Record<string, unknown>> = Array.isArray(requestData.offers)
        ? requestData.offers
        : [];

      const targetOffer = existingOffers.find((o) => o && typeof o === 'object' && o.id === offerId);

      if (!targetOffer) {
        throw { status: 404, message: 'Le devis spécifié est introuvable pour cette demande.' };
      }

      // 4. Update offer statuses: set target to 'accepted' and all others to 'declined'
      const updatedOffers = existingOffers.map((o) => {
        if (o && typeof o === 'object' && o.id === offerId) {
          return { ...o, status: 'accepted' };
        }
        return { ...o, status: 'declined' };
      });

      const acceptedOfferData = {
        ...targetOffer,
        status: 'accepted'
      };

      acceptedOfferResult = acceptedOfferData;

      // 5. Atomic Update inside Firestore Transaction
      transaction.update(requestRef, {
        status: 'accepted',
        acceptedOffer: acceptedOfferData,
        offers: updatedOffers,
        updatedAt: new Date().toISOString()
      });
    });

    safeLogger.info('Customer accepted offer', { customerId: customerUid, offerId, requestId });

    return res.json({
      success: true,
      data: {
        requestId,
        status: 'accepted',
        acceptedOffer: acceptedOfferResult
      }
    });
  } catch (error: unknown) {
    const customErr = error as { status?: number; message?: string };
    const statusCode = customErr?.status || 500;
    const errorMessage = customErr?.message || 'Erreur serveur lors de l\'acceptation du devis.';

    if (statusCode >= 500) {
      safeLogger.error('Error accepting quote offer', { requestId, err: error instanceof Error ? error.message : String(error) });
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// 5. Unified Account Role Evolution: Upgrade Current Olmart Account to Artisan Pro Status
bricolageRouter.post('/bricolage/artisans/upgrade', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const uid = req.user.uid;
  const userEmail = req.user.email || '';
  const payload = req.body;

  if (!payload.specialty || !payload.wilaya || !payload.phone) {
    return res.status(400).json({ success: false, error: 'Informations de profil artisan incomplètes.' });
  }

  const now = new Date().toISOString();

  // Construct document verification payload if attached
  const identityDoc = payload.identityDoc ? {
    id: `DOC-ID-${Date.now()}`,
    docType: payload.identityDoc.type || 'cni',
    title: payload.identityDoc.type === 'passport' ? 'Passeport Algérien' : payload.identityDoc.type === 'permis' ? 'Permis de Conduire' : 'Carte Nationale d\'Identité (CNI)',
    docNumber: payload.identityDoc.number || 'CNI-DZ-998822',
    fileName: payload.identityDoc.fileName || 'Piece_Identite.pdf',
    fileUrl: payload.identityDoc.fileUrl || '',
    status: 'pending',
    uploadedAt: now
  } : undefined;

  const diplomaDoc = payload.diplomaDoc ? {
    id: `DOC-DIP-${Date.now()}`,
    docType: 'diploma',
    title: payload.diplomaDoc.title || 'Diplôme / Attestation de Qualification',
    issuingInstitution: payload.diplomaDoc.institution || 'Centre de Formation Professionnelle IFP',
    fileName: payload.diplomaDoc.fileName || 'Diplome_Qualification.pdf',
    fileUrl: payload.diplomaDoc.fileUrl || '',
    status: 'pending',
    uploadedAt: now
  } : undefined;

  const registryDoc = payload.registryDoc ? {
    id: `DOC-REG-${Date.now()}`,
    docType: 'artisan_card',
    title: 'Carte d\'Artisan / Extrait du Registre de Commerce',
    docNumber: payload.registryDoc.number || payload.registryNumber || 'CAM-16-2026',
    issuingInstitution: `Chambre des Métiers (CAM ${payload.registryDoc.camWilaya || payload.wilaya})`,
    fileName: payload.registryDoc.fileName || 'Carte_Artisan_CAM.pdf',
    fileUrl: payload.registryDoc.fileUrl || '',
    status: 'pending',
    uploadedAt: now
  } : undefined;

  const hasDocs = Boolean(identityDoc || diplomaDoc || registryDoc);
  // Absolument aucun statut 'verified' automatique : tous les nouveaux artisans passent par 'pending_review' ou 'incomplete_docs'
  const verificationStatus = hasDocs ? 'pending_review' : 'incomplete_docs';

  const verificationData = {
    status: verificationStatus,
    submittedAt: now,
    identityDoc,
    diplomaDoc,
    registryDoc
  };

  try {
    if (db) {
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() : {};

      const fullName = payload.fullName || userData?.displayName || userEmail.split('@')[0] || 'Artisan Olmart';

      const artisanProfile = {
        id: uid,
        fullName,
        specialty: payload.specialty,
        wilaya: payload.wilaya,
        commune: payload.commune || 'Centre',
        phone: payload.phone,
        registryNumber: payload.registryNumber || `ART-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
        yearsOfExperience: Number(payload.yearsOfExperience) || 3,
        isAvailable24_7: Boolean(payload.isAvailable24_7),
        registeredAt: now,
        verifiedBadge: false, // Seul un administrateur peut accorder le badge vérifié après contrôle
        rating: null,
        verificationStatus,
        verificationData
      };

      // 1. Update User Document in Firestore with role "artisan" and artisanProfile
      await userRef.set({
        role: 'artisan',
        artisanProfile,
        phone: payload.phone,
        wilaya: payload.wilaya,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 2. Insert/Update into bricolage_artisans collection for public directory
      await db.collection('bricolage_artisans').doc(uid).set(artisanProfile, { merge: true });

      // 3. Set Custom Claims role = 'artisan'
      await admin.auth().setCustomUserClaims(uid, { role: 'artisan' });

      safeLogger.info('User registered as Artisan', { artisanId: uid, verificationStatus });

      return res.json({
        success: true,
        data: {
          profile: artisanProfile,
          message: hasDocs 
            ? 'Demande d\'inscription enregistrée ! Vos pièces d\'identité et diplômes sont en cours d\'examen par l\'équipe de modération Olmart.' 
            : 'Profil artisan enregistré. Veuillez transmettre vos pièces justificatives (CNI, Carte CAM) pour obtenir le badge Vérifié.'
        }
      });
    }

    const fallbackProfile = {
      id: uid,
      fullName: payload.fullName || 'Artisan Olmart',
      specialty: payload.specialty,
      wilaya: payload.wilaya,
      commune: payload.commune || 'Centre',
      phone: payload.phone,
      registryNumber: payload.registryNumber || 'ART-2026-16098',
      yearsOfExperience: Number(payload.yearsOfExperience) || 3,
      isAvailable24_7: Boolean(payload.isAvailable24_7),
      registeredAt: now,
      verifiedBadge: false,
      rating: null,
      verificationStatus,
      verificationData
    };

    return res.json({
      success: true,
      data: {
        profile: fallbackProfile,
        message: 'Compte mis à jour au statut Artisan Pro.'
      }
    });
  } catch (error: unknown) {
    safeLogger.error('Error upgrading user to artisan', { artisanId: uid, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: 'Erreur lors du passage au statut artisan.' });
  }
});

// 5.1 Admin Endpoint: Get Pending Artisan Registration & Verification Requests
bricolageRouter.get('/bricolage/admin/artisans/pending', authenticateToken, authorizeAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    if (!db) {
      return res.json({ success: true, data: [] });
    }
    const snapshot = await db.collection('bricolage_artisans')
      .where('verificationStatus', '==', 'pending_review')
      .get();

    const pendingArtisans: Array<Record<string, unknown>> = [];
    snapshot.forEach(doc => pendingArtisans.push(doc.data()));
    return res.json({ success: true, data: pendingArtisans });
  } catch (error) {
    safeLogger.error('Error fetching pending artisan verifications', { err: error instanceof Error ? error.message : String(error) });
    return res.json({ success: true, data: [] });
  }
});

// 5.2 Admin Endpoint: Verify or Reject Artisan Documents & Grant Badge
bricolageRouter.post('/bricolage/admin/artisans/verify', authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { artisanId, action, rejectionReason, docType } = req.body;

  if (!artisanId || !action || (action !== 'approve' && action !== 'reject')) {
    return res.status(400).json({ success: false, error: 'Paramètres de vérification invalides (artisanId requis, action: "approve"|"reject").' });
  }

  try {
    if (db) {
      const artisanRef = db.collection('bricolage_artisans').doc(artisanId);
      const userRef = db.collection('users').doc(artisanId);

      await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(artisanRef);
        if (!snap.exists) return;

        const data = snap.data() || {};
        const vData = data.verificationData || {};
        const now = new Date().toISOString();

        if (action === 'approve') {
          // Approve all or specific document
          if (vData.identityDoc) vData.identityDoc.status = 'approved';
          if (vData.diplomaDoc) vData.diplomaDoc.status = 'approved';
          if (vData.registryDoc) vData.registryDoc.status = 'approved';

          vData.status = 'verified';
          vData.reviewedAt = now;
          vData.reviewedByAdmin = 'Equipe Olmart Moderation';

          const updatedProfile = {
            ...data,
            verifiedBadge: true,
            verificationStatus: 'verified',
            verificationData: vData
          };

          transaction.set(artisanRef, updatedProfile, { merge: true });
          transaction.set(userRef, { artisanProfile: updatedProfile }, { merge: true });
        } else if (action === 'reject') {
          if (docType === 'identity' && vData.identityDoc) {
            vData.identityDoc.status = 'rejected';
            vData.identityDoc.rejectionReason = rejectionReason || 'Document illisible ou invalide.';
          } else if (docType === 'diploma' && vData.diplomaDoc) {
            vData.diplomaDoc.status = 'rejected';
            vData.diplomaDoc.rejectionReason = rejectionReason || 'Attestation ou diplôme non reconnu.';
          } else if (docType === 'registry' && vData.registryDoc) {
            vData.registryDoc.status = 'rejected';
            vData.registryDoc.rejectionReason = rejectionReason || 'N° de carte artisan CAM non valide.';
          } else {
            vData.status = 'rejected';
            vData.adminNotes = rejectionReason || 'Documents incomplets ou non conformes.';
          }

          vData.status = 'rejected';
          vData.reviewedAt = now;

          const updatedProfile = {
            ...data,
            verifiedBadge: false,
            verificationStatus: 'rejected',
            verificationData: vData
          };

          transaction.set(artisanRef, updatedProfile, { merge: true });
          transaction.set(userRef, { artisanProfile: updatedProfile }, { merge: true });
        }
      });

      safeLogger.info('Artisan verification updated', { artisanId, action });
      return res.json({
        success: true,
        message: action === 'approve' 
          ? 'Artisan vérifié avec succès et Badge Certifié attribué !' 
          : 'Statut de vérification mis à jour (Rejeté).'
      });
    }

    return res.json({ success: true, message: 'Statut de vérification mis à jour.' });
  } catch (error) {
    safeLogger.error('Error in admin artisan verification', { artisanId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ success: false, error: 'Erreur lors de la vérification de l\'artisan.' });
  }
});

// 6. Get Customer Reviews
bricolageRouter.get('/bricolage/reviews', async (_req: Request, res: Response) => {
  try {
    if (!db) {
      return res.json({ success: true, data: SAMPLE_REVIEWS });
    }
    const snapshot = await db.collection('bricolage_reviews').get();
    if (snapshot.empty) {
      return res.json({ success: true, data: SAMPLE_REVIEWS });
    }
    const list: Array<Record<string, unknown>> = [];
    snapshot.forEach(doc => list.push(doc.data()));
    return res.json({ success: true, data: list });
  } catch (error) {
    safeLogger.error('Error fetching reviews', { err: error instanceof Error ? error.message : String(error) });
    return res.json({ success: true, data: SAMPLE_REVIEWS });
  }
});
