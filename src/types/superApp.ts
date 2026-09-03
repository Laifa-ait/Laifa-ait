export interface SuperAppVertical {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  iconName: 'ShoppingBag' | 'Building2' | 'Wrench' | 'Store';
  route: string;
  activePattern: string;
  gradient: string;
  borderHover: string;
  description: string;
  metrics: string;
}

export interface QuickRoleAccess {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  badge: string;
  iconName: 'Briefcase' | 'Building2' | 'Wrench' | 'ShieldCheck';
}
