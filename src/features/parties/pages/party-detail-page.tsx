import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useParty } from "../hooks/use-party";
import { PartyOverview } from "../components/party-overview";
import { ContactsSection } from "../components/contacts-section";
import { LocationsSection } from "../components/locations-section";
import { RelatedOrdersSection } from "../components/related-orders-section";

export function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: party, isLoading, error } = useParty(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Party not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/parties")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{party.description}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground capitalize">{party.type_code.toLowerCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <PartyOverview party={party} />
        <ContactsSection partyGuid={party.guid} />
      </div>

      <LocationsSection partyGuid={party.guid} />
      <RelatedOrdersSection partyGuid={party.guid} />
    </div>
  );
}
