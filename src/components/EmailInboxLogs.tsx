import React, { useState } from "react";
import { EmailLog } from "../types";
import { Mail, Check, Trash2, ShieldCheck, Calendar, User, Eye, Inbox } from "lucide-react";

interface EmailInboxLogsProps {
  emails: EmailLog[];
  onClearEmails: () => Promise<void>;
  selectedEmailIdHook?: string | null;  // Allows auto-highlighting when status updates
}

export default function EmailInboxLogs({ emails, onClearEmails, selectedEmailIdHook }: EmailInboxLogsProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(
    emails.length > 0 ? emails[0].id : null
  );

  // Sync highlighting if a status triggers a new email
  React.useEffect(() => {
    if (selectedEmailIdHook) {
      setSelectedEmailId(selectedEmailIdHook);
    } else if (emails.length > 0 && !selectedEmailId) {
      setSelectedEmailId(emails[0].id);
    }
  }, [selectedEmailIdHook, emails]);

  // Use either selectedEmailIdHook or state
  const activeId = selectedEmailIdHook || selectedEmailId || (emails.length > 0 ? emails[0].id : null);
  const activeEmail = emails.find(e => e.id === activeId) || emails[0];

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="w-2.5 h-2.5 bg-slate-400 rounded-full shrink-0" title="Order Received" />;
      case "processing":
        return <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" title="In Assembly" />;
      case "shipped":
        return <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0" title="Dispatched" />;
      case "delivered":
        return <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" title="Delivered" />;
      default:
        return <span className="w-2.5 h-2.5 bg-slate-400 rounded-full shrink-0" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs h-[540px]" id="email_inbox_logs_view">
      
      {/* List column - width 5 */}
      <div className="md:col-span-5 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-1.5 text-slate-800">
            <Mail className="w-4 h-4 text-slate-700" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Automated Notification Inbox</h4>
          </div>
          {emails.length > 0 && (
            <button
              onClick={onClearEmails}
              id="clear-emails-btn"
              className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold uppercase flex items-center gap-1 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear logs
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {emails.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
              <Mail className="w-8 h-8 text-slate-300" />
              <div>
                <p className="font-semibold text-slate-700 text-xs">Aura mailroom is quiet</p>
                <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                  Place an order or update tracked order milestone status on the dashboard to dispatch instant notification emails and log SMTP outputs here.
                </p>
              </div>
            </div>
          ) : (
            emails.map((e) => {
              const isActive = e.id === activeId;
              const sentDate = new Date(e.sentAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
              return (
                <button
                  key={e.id}
                  id={`email-log-row-${e.id}`}
                  onClick={() => setSelectedEmailId(e.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex gap-3 cursor-pointer ${
                    isActive
                      ? "bg-white border-slate-900 shadow-xs"
                      : "bg-white/40 border-transparent hover:border-slate-100 hover:bg-white"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {getStatusIndicator(e.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        AURA SYSTEM MAILER
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold">{sentDate}</span>
                    </div>
                    <p className="font-semibold text-xs text-slate-800 truncate leading-tight">
                      {e.subject}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Target: <span className="font-mono">{e.to}</span>
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Render HTML iframe pane - width 7 */}
      <div className="md:col-span-7 flex flex-col h-full bg-white">
        {activeEmail ? (
          <div className="flex flex-col h-full">
            {/* Mail header metadata */}
            <div className="p-4 border-b border-slate-50 bg-slate-50/20 text-xs space-y-1.5 shrink-0 text-left">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Sender: <strong className="text-slate-800">system-mailer@auradesign.co</strong>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DKIM Verified SPF
                </span>
              </div>
              <p className="text-slate-500 font-medium text-[11px]">
                To: <span className="text-slate-800 font-mono font-semibold">{activeEmail.to}</span>
              </p>
              <h3 className="font-bold text-slate-900 text-sm">{activeEmail.subject}</h3>
            </div>

            {/* Sandbox Render Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50 flex justify-center items-start">
              <div 
                className="w-full bg-white shadow-xs rounded-xl overflow-hidden text-left scale-[0.98] origin-top"
                dangerouslySetInnerHTML={{ __html: activeEmail.bodyHtml }}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <Inbox className="w-10 h-10 text-slate-300" />
            <div>
              <p className="font-semibold text-slate-800 text-xs text-slate-400">SMTP Sandbox Monitor</p>
              <p className="text-[10px] text-slate-400 max-w-sm mt-1">
                Select an automated system log dispatch on the left to see the high fidelity HTML receipt and tracking outputs exactly as delivered to customers.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
