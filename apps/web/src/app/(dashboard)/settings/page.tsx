"use client";

import { PageHeading } from "@/components/page-heading";
import { Card, SectionLabel } from "@/components/ui/card";
import { useDrawer } from "@/components/drawer";
import { settingsGroups } from "@/lib/mock-data";

export default function SettingsPage() {
  const { open } = useDrawer();

  return (
    <>
      <PageHeading title="Settings" side="tom@ellisgas.co.uk" />
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 overflow-auto">
        {settingsGroups.map((g) => (
          <Card key={g.title} className="min-h-0">
            <SectionLabel>{g.title}</SectionLabel>
            <div className="mt-3.5 flex flex-col">
              {g.rows.map((r) => (
                <button
                  key={r.k}
                  onClick={() =>
                    open({
                      tag: g.title,
                      title: r.k,
                      facts: r.v ? [{ k: "Now", v: r.v }] : [],
                      options: [
                        { label: "Change", primary: true },
                        { label: "Cancel", self: true },
                      ],
                    })
                  }
                  className="flex cursor-pointer items-center justify-between gap-5 border-b border-line-subtle py-3.5 text-left"
                >
                  <div className="text-body text-text-primary">{r.k}</div>
                  <div className="text-body text-text-muted">{r.v}</div>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
