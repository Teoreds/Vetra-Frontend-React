import { useQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

interface ContactsSectionProps {
  partyGuid: string;
}

export function ContactsSection({ partyGuid }: ContactsSectionProps) {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: partyKeys.contacts(partyGuid),
    queryFn: async () => {
      const { data, error } = await partiesApi.listContacts(partyGuid);
      if (error) throw error;
      return data;
    },
    enabled: !!partyGuid,
  });

  if (isLoading) {
    return <div className="animate-pulse h-20 rounded-xl bg-muted" />;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Contacts
      </h3>
      {contacts.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No contacts added.</p>
      ) : (
        <ul className="space-y-2.5">
          {contacts.map((contact) => (
            <li key={contact.guid} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                {contact.type_code === "EMAIL" ? (
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-[13px] font-medium">{contact.content}</p>
                {contact.label && (
                  <p className="text-[11px] text-muted-foreground">{contact.label}</p>
                )}
              </div>
              {contact.is_primary && (
                <span className="ml-auto rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Primary
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
