import { BusinessInfo, NavLink, StoreHighlight, PolicyItemData, ContactCardData } from '../types';

export const BUSINESS_INFO: BusinessInfo = {
  name: "Highlander Gold & Silver",
  shortName: "HGS",
  address: "119 Jewel Basin Ct. B3, Bigfork, MT 59911",
  street: "119 Jewel Basin Ct. B3",
  city: "Bigfork",
  state: "MT",
  zip: "59911",
  phone: "4064070281",
  phoneFormatted: "(406) 407-0281",
  email: "Stratford1955@icloud.com",
  payPalUrl: "https://paypal.me/HighlanderGoldSilver",
  coordinates: "48°03'47.9\"N 114°04'20.6\"W",
  terms: {
    buyersPremium: "15%",
    buyersPremiumPercent: 0.15,
    shipping: "USPS Priority & Ground, fully insured in-house packaging",
    salesTax: "Montana Tax-Exempt (0% State Sales Tax)",
    closeTrigger: "Direct storefront purchase with instant checkout via PayPal",
    hours: "Online Storefront Open 24/7"
  }
};

export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#hero' },
  { label: 'Collection', href: '#collection' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' }
];

export const FOOTER_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#hero' },
  { label: 'Collection', href: '#collection' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' }
];

export const INVENTORY_CLASSIFICATIONS: NavLink[] = [
  { label: 'Sovereign Gold Coins', href: '#collection' },
  { label: 'Morgan Silver Dollars', href: '#collection' },
  { label: 'Silver Bullion & Bars', href: '#collection' },
  { label: 'Commemorative Proofs', href: '#collection' },
  { label: 'Ancient Numismatics', href: '#collection' }
];

export const STORE_HIGHLIGHTS: StoreHighlight[] = [
  {
    title: "Direct Storefront Purchase",
    description: "Browse curated inventory and purchase directly with seamless checkout or inquiry. No bidding wars, timed auction blocks, or waiting for listing clocks to expire.",
    iconName: "clock"
  },
  {
    title: "Sold Value Guarantee",
    description: "Every coin is hand-picked for authentic eye appeal, luster, and strike. If proof is presented that an acquired coin was overpriced based on market state, HGS refunds the difference or accepts as-sold return.",
    iconName: "shieldCheck"
  },
  {
    title: "In-House Insured Delivery",
    description: "All packaging and fulfillment is performed in-house from our Bigfork facility. Every parcel ships via USPS Priority or Ground, fully insured with delivery confirmation.",
    iconName: "package"
  },
  {
    title: "Transparent 15% Settlement",
    description: "Flat 15% settlement fee across inventory with 0% Montana state sales tax. Direct PayPal checkout with instant confirmation, or wire credit on high-value acquisitions.",
    iconName: "creditCard"
  }
];

export const SETTLEMENT_POLICIES: PolicyItemData[] = [
  {
    title: "1. Insured Domestic Shipping",
    description: "All domestic shipments are fulfilled in-house via USPS Priority or Ground. Every parcel includes full insurance and postal tracking. Packages exceeding $500 require a signature upon delivery.",
    iconName: "package"
  },
  {
    title: "2. High-Dollar Wire Transfer Credit",
    description: "For high-value bullion or gold acquisitions that exceed credit card limits, bank wire payment is accepted with an incoming wire fee credit applied directly to your settlement.",
    iconName: "creditCard"
  },
  {
    title: "3. 24-Hour Settlement Window",
    description: "Settlement is requested within 24 hours of invoice issuance. Prompt payments guarantee next-business-day dispatch from our Bigfork facility.",
    iconName: "clock"
  }
];

export const CONTACT_CARDS: ContactCardData[] = [
  {
    label: "Physical Armory",
    title: "Bigfork, Montana",
    text: "119 Jewel Basin Ct. B3\nBigfork, MT 59911",
    subtext: "Flathead County · Private Consultations",
    actionText: "Get Directions",
    actionHref: "https://maps.google.com/?q=119+Jewel+Basin+Ct+B3+Bigfork+MT+59911",
    isExternal: true,
    iconName: "mapPin"
  },
  {
    label: "Direct Telephone",
    title: "406-407-0281",
    text: "Monday – Saturday\n9:00 AM – 6:00 PM MT",
    subtext: "Direct voice line for collectors",
    actionText: "Call (406) 407-0281",
    actionHref: "tel:4064070281",
    isExternal: false,
    iconName: "phone"
  },
  {
    label: "Electronic Mail",
    title: "Stratford1955@icloud.com",
    text: "Direct storefront inquiries, private treaty acquisitions & provenance questions answered directly.",
    actionText: "Email Us",
    actionHref: "mailto:Stratford1955@icloud.com",
    isExternal: false,
    iconName: "mail"
  },
  {
    label: "Settlement Gateway",
    title: "paypal.me/HighlanderGoldSilver",
    text: "Official verified PayPal self-pay portal with comprehensive buyer protection.",
    actionText: "Visit PayPal",
    actionHref: "https://paypal.me/HighlanderGoldSilver",
    isExternal: true,
    iconName: "creditCard"
  }
];
