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

    return {
      success: true,
      message: `Campagne envoyée avec succès à ${count} abonnés !`
    };
  }

  async getStats(): Promise<NewsletterStats> {
    const totalSubscribed = await this.repo.getSubscribersCount("subscribed");
    const totalUnsubscribed = await this.repo.getSubscribersCount("unsubscribed");

    return {
      totalSubscribed,
      totalUnsubscribed,
      averageOpenRate: 0,
      averageClickRate: 0,
      growthChart: [],
      logs: [],
    };
  }

  async getSubscribers(): Promise<{ subscribers: NewsletterSubscriber[] }> {
    const subscribers = (await this.repo.getSubscribers(500)) as NewsletterSubscriber[];
    return { subscribers };
  }

  async getCampaigns(): Promise<{ campaigns: NewsletterCampaign[] }> {
    const campaigns = (await this.repo.getCampaigns(100)) as NewsletterCampaign[];
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

