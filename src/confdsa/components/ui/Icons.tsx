// Icons come from lucide-react; the aliases keep one name per meaning across the site.
// Lucide no longer ships brand logos, so the Instagram mark is drawn here.
export {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Award as AwardIcon,
  Bed as BedIcon,
  BookOpen as BookIcon,
  Landmark as BuildingIcon,
  Calendar as CalendarIcon,
  ChartColumn as BarChartIcon,
  ChartPie as PieChartIcon,
  ChevronDown as ChevronDownIcon,
  ClipboardList as ClipboardIcon,
  Clock as ClockIcon,
  Coffee as CoffeeIcon,
  CreditCard as CreditCardIcon,
  Database as DatabaseIcon,
  Dna as DnaIcon,
  Download as DownloadIcon,
  ExternalLink as ExternalLinkIcon,
  FileText as FileTextIcon,
  FingerprintPattern as FingerprintIcon,
  Funnel as FilterIcon,
  Globe as GlobeIcon,
  House as HomeIcon,
  Layers as LayersIcon,
  LayoutGrid as GridIcon,
  Lightbulb as LightbulbIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  Menu as MenuIcon,
  Mic as MicIcon,
  Navigation as NavigationIcon,
  Server as ServerIcon,
  Sigma as SigmaIcon,
  Trophy as TrophyIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon,
  X as CloseIcon,
} from "lucide-react";

export type { LucideIcon as IconComponent } from "lucide-react";

export function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}
