import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Copy, Check, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useContactTypes } from "@/shared/hooks/use-lookups";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

interface ContactsSectionProps {
  partyGuid: string;
  onAdd?: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-md p-1 text-muted-foreground/50 transition-colors hover:text-foreground hover:bg-muted"
      aria-label="Copia"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

export function ContactsSection({ partyGuid, onAdd }: ContactsSectionProps) {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: partyKeys.contacts(partyGuid),
    queryFn: async () => {
      const { data, error } = await partiesApi.listContacts(partyGuid);
      if (error) throw error;
      return data;
    },
    enabled: !!partyGuid,
  });

  const { map: contactTypeMap } = useContactTypes();

  if (isLoading) {
    return <div className="animate-pulse h-20 rounded-xl bg-muted" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Contatti</h2>
          </div>
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Nessun contatto aggiunto.</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.guid}
                className="relative flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 pr-5"
              >
                <div className="w-16 shrink-0">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {contactTypeMap.get(contact.type_code) ?? contact.type_code}
                  </span>
                  {contact.label && (
                    <p className="text-[10px] text-muted-foreground/50 leading-tight truncate">{contact.label}</p>
                  )}
                </div>
                <span className="text-[13px] flex-1 truncate">{contact.content}</span>
                <CopyButton text={contact.content} />
                {contact.is_primary && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-foreground/25" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
