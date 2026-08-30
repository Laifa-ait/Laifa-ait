import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CheckCircle2, XCircle, FileText, Award, CreditCard, Eye, RefreshCw, HardHat } from 'lucide-react';
import { ActiveArtisanProfile } from '../../types/bricolage';
import { fetchPendingArtisanVerifications, adminVerifyArtisanDoc } from '../../services/bricolage.api';

interface ArtisanVerificationAdminModalProps {
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const ArtisanVerificationAdminModal: React.FC<ArtisanVerificationAdminModalProps> = ({ onClose, onStatusUpdated }) => {
  const [pendingArtisans, setPendingArtisans] = useState<ActiveArtisanProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtisan, setSelectedArtisan] = useState<ActiveArtisanProfile | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; type: string; url?: string; name?: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadPending = async () => {
    setLoading(true);
    const list = await fetchPendingArtisanVerifications();
    const cleanList = Array.isArray(list) ? list : [];
    setPendingArtisans(cleanList);
    if (cleanList.length > 0) {
      setSelectedArtisan(cleanList[0]);
    } else {
      setSelectedArtisan(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApproveAll = async (artisan: ActiveArtisanProfile) => {
    setProcessingId(artisan.id);
    await adminVerifyArtisanDoc({
      artisanId: artisan.id,
      action: 'approve'
    });
    setFeedback(`Artisan ${artisan.fullName} approuvé avec succès ! Badge Certifié attribué.`);
    setProcessingId(null);

    // Remove from local pending list
    setPendingArtisans(prev => prev.filter(a => a.id !== artisan.id));
    if (selectedArtisan?.id === artisan.id) {
      const remaining = pendingArtisans.filter(a => a.id !== artisan.id);
      setSelectedArtisan(remaining[0] || null);
    }
    if (onStatusUpdated) onStatusUpdated();
  };

  const handleReject = async (artisan: ActiveArtisanProfile, docType?: 'identity' | 'diploma' | 'registry') => {
    setProcessingId(artisan.id);
    await adminVerifyArtisanDoc({
      artisanId: artisan.id,
      action: 'reject',
      rejectionReason: rejectionReason || 'Pièces illisibles ou non conformes.',
      docType
    });
    setFeedback(`Demande d'artisan ${artisan.fullName} mise à jour (Rejeté/Demande de révision).`);
    setProcessingId(null);

    setPendingArtisans(prev => prev.filter(a => a.id !== artisan.id));
    if (selectedArtisan?.id === artisan.id) {
      const remaining = pendingArtisans.filter(a => a.id !== artisan.id);
      setSelectedArtisan(remaining[0] || null);
    }
    if (onStatusUpdated) onStatusUpdated();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border-2 border-slate-200 text-slate-900 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-slate-950 p-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow">
                <ShieldCheck className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Modération Olmart Core
                </span>
                <h2 className="text-lg font-black text-white">
                  Vérification des Inscriptions d'Artisans (Diplômes & Cartes)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadPending}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Rafraîchir les demandes"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {feedback && (
            <div className="bg-emerald-500 text-slate-950 px-5 py-2.5 text-xs font-black flex items-center justify-between">
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)} className="text-slate-950 hover:underline">Fermer</button>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Queue: Pending Applicants */}
            <div className="md:col-span-4 border-r border-slate-200 bg-slate-50 p-4 space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-black text-slate-700 pb-2 border-b border-slate-200">
                <span>Demandes en attente ({pendingArtisans.length})</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                  À vérifier
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500">Chargement...</div>
              ) : pendingArtisans.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Toutes les demandes ont été traitées !</p>
                </div>
              ) : (
                pendingArtisans.map((art) => {
                  const isSelected = selectedArtisan?.id === art.id;
                  return (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArtisan(art)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{art.fullName}</h4>
                          <span className="text-[11px] font-bold text-amber-700 block">{art.specialty}</span>
                          <span className="text-[10px] font-semibold text-slate-500 block">
                            {art.wilaya} • {art.commune}
                          </span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                          {art.verificationData?.identityDoc ? '3 Pièces' : '1 Pièce'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Details & Inspection Panel */}
            <div className="md:col-span-8 p-6 space-y-6 overflow-y-auto bg-white">
              {selectedArtisan ? (
                <div className="space-y-6">
                  {/* Candidate Identity summary */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-xl shrink-0">
                        {selectedArtisan.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">{selectedArtisan.fullName}</h3>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            {selectedArtisan.yearsOfExperience} Ans d'exp.
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-amber-700">{selectedArtisan.specialty}</p>
                        <p className="text-xs font-bold text-slate-600">
                          Wilaya : <strong className="text-slate-900">{selectedArtisan.wilaya} ({selectedArtisan.commune})</strong> • Tél: {selectedArtisan.phone}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApproveAll(selectedArtisan)}
                      disabled={processingId === selectedArtisan.id}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider & Attribuer Badge Certifié</span>
                    </button>
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                      Pièces Justificatives Soumises par l'Artisan
                    </h4>

                    {/* Document 1: CNI */}
                    {selectedArtisan.verificationData?.identityDoc ? (
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 font-black">
                            <CreditCard className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                              Vérification d'Identité
                            </span>
                            <h5 className="text-xs font-black text-slate-900 mt-1">
                              {selectedArtisan.verificationData.identityDoc.title}
                            </h5>
                            <p className="text-[11px] font-semibold text-slate-600">
                              N° : <strong className="text-slate-900">{selectedArtisan.verificationData.identityDoc.docNumber}</strong> • Fichier: {selectedArtisan.verificationData.identityDoc.fileName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewDoc({
                              title: selectedArtisan.verificationData!.identityDoc!.title,
                              type: selectedArtisan.verificationData!.identityDoc!.docType,
                              name: selectedArtisan.verificationData!.identityDoc!.fileName,
                              url: selectedArtisan.verificationData!.identityDoc!.fileUrl
                            })}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                            <span>Inspecter Document</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500">
                        Aucune pièce d'identité officielle joignable.
                      </div>
                    )}

                    {/* Document 2: Diplôme */}
                    {selectedArtisan.verificationData?.diplomaDoc ? (
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-black">
                            <Award className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                              Attestation de Qualification
                            </span>
                            <h5 className="text-xs font-black text-slate-900 mt-1">
                              {selectedArtisan.verificationData.diplomaDoc.title}
                            </h5>
                            <p className="text-[11px] font-semibold text-slate-600">
                              Établissement : <strong className="text-slate-900">{selectedArtisan.verificationData.diplomaDoc.issuingInstitution}</strong> • Fichier: {selectedArtisan.verificationData.diplomaDoc.fileName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewDoc({
                              title: selectedArtisan.verificationData!.diplomaDoc!.title,
                              type: selectedArtisan.verificationData!.diplomaDoc!.docType,
                              name: selectedArtisan.verificationData!.diplomaDoc!.fileName,
                              url: selectedArtisan.verificationData!.diplomaDoc!.fileUrl
                            })}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Inspecter Diplôme</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500">
                        Aucun diplôme ou certificat de qualification joint.
                      </div>
                    )}

                    {/* Document 3: Carte Artisan CAM */}
                    {selectedArtisan.verificationData?.registryDoc ? (
                      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 font-black">
                            <FileText className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded">
                              Carte Professionnelle CAM / Registre
                            </span>
                            <h5 className="text-xs font-black text-slate-900 mt-1">
                              {selectedArtisan.verificationData.registryDoc.title}
                            </h5>
                            <p className="text-[11px] font-semibold text-slate-600">
                              N° CAM/RC: <strong className="text-slate-900">{selectedArtisan.verificationData.registryDoc.docNumber}</strong> • Organisme: {selectedArtisan.verificationData.registryDoc.issuingInstitution}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewDoc({
                              title: selectedArtisan.verificationData!.registryDoc!.title,
                              type: selectedArtisan.verificationData!.registryDoc!.docType,
                              name: selectedArtisan.verificationData!.registryDoc!.fileName,
                              url: selectedArtisan.verificationData!.registryDoc!.fileUrl
                            })}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-700" />
                            <span>Inspecter Carte CAM</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500">
                        Aucun numéro de carte d'artisan CAM joint.
                      </div>
                    )}
                  </div>

                  {/* Rejection / Refusal Input Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <label className="text-xs font-bold text-slate-800 block">
                      Motif de Refus ou Demande de Révision (Optionnel) :
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ex: Scan de la pièce d'identité flou ou illisible, veuillez ré-envoyer la copie CNI."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-900"
                    />

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleReject(selectedArtisan)}
                        className="py-2.5 px-4 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs flex items-center gap-1.5 border border-rose-300"
                      >
                        <XCircle className="w-4 h-4 text-rose-700" />
                        <span>Rejeter la Demande</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center space-y-2 text-slate-500">
                  <HardHat className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs font-bold">Sélectionnez une demande d'artisan à gauche pour inspecter ses diplômes.</p>
                </div>
              )}
            </div>
          </div>

          {/* Document Preview Lightbox Modal */}
          {previewDoc && (
            <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative border-2 border-amber-400">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{previewDoc.title}</h4>
                    <p className="text-xs font-bold text-slate-500">Document Officiel Soumis • {previewDoc.name}</p>
                  </div>
                </div>

                <div className="p-8 rounded-2xl bg-slate-100 border border-slate-300 text-center space-y-3 min-h-[220px] flex flex-col items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div className="text-xs font-black text-slate-800">
                    Aperçu Sécurisé de la Pièce de Vérification
                  </div>
                  <p className="text-[11px] text-slate-600 max-w-xs font-semibold">
                    [Scan Officiel Conforme] N° d'accréditation valide, cachet et hologramme de la Wilaya authentifié.
                  </p>
                </div>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Fermer l'Inspection
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
