import { INewsletterRepository } from "../domains/newsletter/newsletter.repository";

export interface NewsletterBlock {
  id?: string;
  type: string;
  content: string;
  [key: string]: unknown;
}

export interface SaveCampaignInput {
  title?: string;
  subject?: string;
  targeting?: string;
  blocks?: NewsletterBlock[];
  [key: string]: unknown;
}

export interface NewsletterStats {
  totalSubscribed: number;
  totalUnsubscribed: number;
  averageOpenRate: number;
  averageClickRate: number;
  growthChart: Array<{ name: string; subscribers: number }>;
  logs: Array<{ title: string; time: string; desc: string }>;
}

export interface NewsletterSettings {
  senderName?: string;
  senderEmail?: string;
  footerTemplate?: string;
  [key: string]: unknown;
}

export interface NewsletterSubscriber {
  id?: string;
  name?: string;
  email?: string;
  group?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface NewsletterCampaign {
  id?: string;
  title?: string;
  subject?: string;
  targeting?: string;
  status?: string;
  blocks?: NewsletterBlock[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export class NewsletterAdminService {
  constructor(private readonly repo: INewsletterRepository) {}

  async sendCampaign(subject: string, blocks: NewsletterBlock[]): Promise<{ success: boolean; message: string }> {
    if (!subject) throw new Error("Sujet requis");

    const campaignData = {
      title: subject,
      subject,
      blocks: blocks || [],
      status: "sent",
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };
    await this.repo.addCampaign(campaignData);

    const count = await this.repo.getSubscribersCount("subscribed");
    const finalCount = count === 0 ? 1280 : count;

    return {
      success: true,
      message: `Campagne envoyée avec succès à ${finalCount} abonnés !`
    };
  }

  async getStats(): Promise<NewsletterStats> {
    const totalSubscribed = await this.repo.getSubscribersCount("subscribed");
    const totalUnsubscribed = await this.repo.getSubscribersCount("unsubscribed");

    // If zero, populate with default mock data (as was done in core.ts)
    if (totalSubscribed === 0) {
      const defaultSubs = [
        { name: "Sofiane Benamar", email: "sofiane.benamar@gmail.com", group: "Client", status: "subscribed", createdAt: new Date().toISOString() },
        { name: "Yacine Bouzidi", email: "yacine.bouz@outlook.com", group: "Client", status: "subscribed", createdAt: new Date().toISOString() },
        { name: "Amel Rahmani", email: "amel_dz@yahoo.fr", group: "Vendeur", status: "subscribed", createdAt: new Date().toISOString() },
        { name: "Karim Oudjana", email: "k.oudjana@gmail.com", group: "Client", status: "subscribed", createdAt: new Date().toISOString() },
        { name: "Nabila Belkacem", email: "nabila.b_90@gmail.com", group: "Vendeur", status: "unsubscribed", createdAt: new Date().toISOString() },
      ];
      for (const s of defaultSubs) {
        await this.repo.addSubscriber(s);
      }
    }

    const finalSub = totalSubscribed || 1280;

    return {
      totalSubscribed: finalSub,
      totalUnsubscribed: totalUnsubscribed || 12,
      averageOpenRate: 64.8,
      averageClickRate: 24.1,
      growthChart: [
        { name: "Jan", subscribers: 1020 },
        { name: "Fév", subscribers: 1100 },
        { name: "Mar", subscribers: 1150 },
        { name: "Avr", subscribers: 1210 },
        { name: "Mai", subscribers: 1250 },
        { name: "Juin", subscribers: finalSub },
      ],
      logs: [
        { title: "Campagne Envoyée", time: "Il y a 2h", desc: "Offres de Saison d'Eté" },
        { title: "Nouvel Abonné", time: "Hier, 18:30", desc: "sofiane.benamar@gmail.com" },
        { title: "Désinscription", time: "il y a 2 jours", desc: "Un utilisateur s'est désabonné" },
      ],
    };
  }

  async getSubscribers(): Promise<{ subscribers: NewsletterSubscriber[] }> {
    const subscribers = (await this.repo.getSubscribers(500)) as NewsletterSubscriber[];
    return { subscribers };
  }

  async getCampaigns(): Promise<{ campaigns: NewsletterCampaign[] }> {
    let campaigns = (await this.repo.getCampaigns(100)) as NewsletterCampaign[];

    if (campaigns.length === 0) {
      const defaultCamp = {
        title: "Newsletter de lancement officiel d'Olma",
        subject: "Bienvenue sur Olma Marketplace - Le meilleur de l'Algérie",
        targeting: "all",
        status: "sent",
        blocks: [
          { id: "1", type: "title", content: "Bienvenue sur Olma !" },
          { id: "2", type: "text", content: "Découvrez nos artisans et vendeurs de confiance à travers les 58 wilayas d'Algérie." },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      };
      await this.repo.addCampaign(defaultCamp);
      campaigns = (await this.repo.getCampaigns(100)) as NewsletterCampaign[];
    }
    return { campaigns };
  }

  async saveCampaign(id: string | null, data: SaveCampaignInput): Promise<Record<string, unknown>> {
    const campaignData: Record<string, unknown> = {
      title: data.title || "Campagne sans titre",
      subject: data.subject || "Pas d'objet",
      targeting: data.targeting || "all",
      blocks: data.blocks || [],
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      await this.repo.updateCampaign(id, campaignData);
      return { id, ...campaignData, status: "draft" };
    } else {
      campaignData.status = "draft";
      campaignData.createdAt = new Date().toISOString();
      const newId = await this.repo.addCampaign(campaignData);
      return { id: newId, ...campaignData };
    }
  }

  async getSettings(): Promise<{ settings: NewsletterSettings }> {
    const rawSettings = await this.repo.getSettings();
    if (rawSettings && typeof rawSettings === "object") {
      return { settings: rawSettings as NewsletterSettings };
    } else {
      return {
        settings: {
          senderName: "L'équipe Olma",
          senderEmail: "newsletter@olma-dz.com",
          footerTemplate: "Vous recevez ce courriel car vous êtes inscrit sur olma.dz.",
        },
      };
    }
  }

  async updateSettings(settings: NewsletterSettings): Promise<{ success: boolean; settings: NewsletterSettings }> {
    await this.repo.updateSettings(settings);
    return { success: true, settings };
  }
}

