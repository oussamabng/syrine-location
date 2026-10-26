import Link from "next/link";
/** Original concept logo for an independent Chawki Auto Oran website proposal. */
export function Brand({ inverted = false, href = "/", label = "Chawki Auto Oran — Accueil" }: { inverted?: boolean; href?: string; label?: string }) {
 return <Link href={href} aria-label={label} className={`brand ${inverted ? "brand-inverted" : ""}`}>
   <svg className="chawki-logo-svg" viewBox="0 0 400 104" width="194" height="51" role="img" aria-label="Chawki Auto Oran" xmlns="http://www.w3.org/2000/svg">
     <g transform="translate(4 4)"><path d="M46 3 88 16V49C88 71 70 85 46 95 22 85 4 71 4 49V16Z" fill="#202732" stroke="#E7EBF0" strokeWidth="2.2"/><path d="M46 12 79 22v28c0 17-14 28-33 36C27 78 13 67 13 50V22Z" fill="none" stroke="#DA4854" strokeWidth="2"/><path d="m17 54 8-12h41l10 12v10h-8v-5H26v5h-8Z" fill="#EFF3F6"/><path d="m32 42 8-11h19l8 11" stroke="#EFF3F6" strokeWidth="3" fill="none" strokeLinejoin="round"/><circle cx="29" cy="54" r="4" fill="#DA4854"/><circle cx="65" cy="54" r="4" fill="#DA4854"/><path d="M22 26H70" stroke="#DA4854" strokeWidth="2" strokeLinecap="round"/></g>
     <text x="110" y="55" fontFamily="Arial,Helvetica,sans-serif" fontWeight="900" fontSize="39" letterSpacing="2" fill="currentColor">CHAWKI</text>
     <text x="112" y="81" fontFamily="Arial,Helvetica,sans-serif" fontWeight="700" fontSize="17" letterSpacing="8.5" fill="#DA4854">AUTO ORAN</text>
   </svg>
 </Link>;
}
