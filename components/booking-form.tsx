/** Non-operational booking example for an unsolicited redesign proposal. */
import type { Vehicle } from "@/lib/data";
export function BookingForm({ vehicle }: { vehicle: Vehicle }) {
 return <div className="demo-notice" role="status"><strong>Parcours de réservation — démonstration</strong><p style={{margin:'8px 0 0'}}>La demande en ligne pour {vehicle.name} n’est pas activée. Le catalogue, les disponibilités et les tarifs sont uniquement illustratifs. Cette fonction sera configurée avec les vraies données de l’agence après validation.</p></div>;
}
