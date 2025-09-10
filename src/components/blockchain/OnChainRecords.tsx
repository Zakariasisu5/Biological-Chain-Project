import React, { useEffect, useState } from "react";
import { fetchRecords } from "@/integrations/medicalContract";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { File, ExternalLink } from "lucide-react";

type ChainRecord = {
  cid: string;
  fileType: string;
  meta: string;
  timestamp: number;
  addedBy: string;
};

export default function OnChainRecords() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<ChainRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id) fetchChain();
  }, [currentUser]);

  async function fetchChain() {
    if (!currentUser?.walletAddress && !(window as any).ethereum) {
      // try anyway if ethereum available
    }
    setLoading(true);
    try {
      const addr = (await (async () => {
        if ((window as any).ethereum) {
          const provider = new (await import("ethers")).BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          return await signer.getAddress();
        }
        return undefined;
      })()) || currentUser?.id;
      if (!addr) {
        setRecords([]);
        setLoading(false);
        return;
      }
      const out = await fetchRecords(addr);
      setRecords(out);
    } catch (e) {
      console.error("fetchRecords failed", e);
    } finally {
      setLoading(false);
    }
  }

  function findLocalByCid(cid: string) {
    try {
      const map = JSON.parse(localStorage.getItem("bcp_cid_map") || "{}");
      const localId = map[cid];
      if (!localId) return null;
      const uploads = JSON.parse(localStorage.getItem("bcp_uploads") || "[]") as any[];
      return uploads.find(u => u.id === localId) || null;
    } catch (e) {
      return null;
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Records on-chain: {records.length}</div>
        <div>
          <Button variant="ghost" size="sm" onClick={fetchChain} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
        </div>
      </div>

      <div className="grid gap-2">
        {records.length === 0 && <div className="text-sm text-muted-foreground">No on-chain records found.</div>}
        {records.map((r, idx) => {
          const local = findLocalByCid(r.cid);
          return (
            <div key={`${r.cid}-${idx}`} className="p-3 border rounded-md flex items-start gap-3">
              <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
                <File className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.fileType} • {new Date(r.timestamp * 1000).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Added by {r.addedBy}</div>
                </div>
                <div className="text-sm mt-2">
                  {r.meta || "-"}
                </div>

                <div className="flex gap-2 mt-3">
                  {local ? (
                    <>
                      {local.type?.startsWith("image/") ? (
                        <img src={local.dataUrl} alt={local.name} className="h-24 rounded" />
                      ) : local.type?.startsWith("video/") ? (
                        <video src={local.dataUrl} controls className="h-24 rounded" />
                      ) : (
                        <div className="p-2 border rounded text-sm">{local.name}</div>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => {
                        const a = document.createElement("a");
                        a.href = local.dataUrl;
                        a.download = local.name;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      }}>Download Local</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => window.open(`https://dweb.link/ipfs/${r.cid}`, "_blank")}>Open IPFS</Button>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(r.cid)}>Copy CID</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}