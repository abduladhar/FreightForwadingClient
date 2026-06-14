import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { lookupTranslation } from "@/api/languageApi";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";

export function TranslationListPage() {
  const [groupName, setGroupName] = useState("");
  const [key, setKey] = useState("");
  const [results, setResults] = useState<Array<{ groupName: string; key: string; value: string; source: string }>>([]);
  const lookup = useMutation({
    mutationFn: lookupTranslation,
    onSuccess: (data, variables) => {
      setResults((prev) => [{ groupName: variables.groupName, key: variables.key, value: data.value, source: data.source }, ...prev].slice(0, 50));
    }
  });
  return (
    <div className="space-y-4">
      <PageHeader title="Translations Lookup" description="Lookup translated values by resource group and key." />
      <Card><CardContent className="pt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1"><Label>Group Name</Label><Input value={groupName} onChange={(e) => setGroupName(e.target.value)} /></div>
        <div className="space-y-1"><Label>Key</Label><Input value={key} onChange={(e) => setKey(e.target.value)} /></div>
        <div className="self-end"><Button disabled={!groupName || !key || lookup.isPending} onClick={() => lookup.mutate({ groupName, key, preferredLanguageId: null, userId: null })}>Lookup</Button></div>
      </CardContent></Card>
      {results.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:hidden">
            {results.map((result, index) => (
              <article key={`${result.groupName}-${result.key}-${index}`} className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
                <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{result.groupName}</p>
                  <h2 className="mt-1 break-words text-base font-semibold text-gray-900 dark:text-gray-100">{result.key}</h2>
                </div>
                <dl className="flex flex-col">
                  <div className="flex min-w-0 flex-col gap-1 border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800"><dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Value</dt><dd className="break-words text-sm font-semibold text-gray-900 dark:text-gray-100">{result.value}</dd></div>
                  <div className="flex min-w-0 flex-col gap-1 border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800"><dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</dt><dd className="break-words text-sm font-semibold text-gray-900 dark:text-gray-100">{result.source}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr className="border-b text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="px-3 py-3 text-left">Group</th>
                  <th className="px-3 py-3 text-left">Key</th>
                  <th className="px-3 py-3 text-left">Value</th>
                  <th className="px-3 py-3 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={`${result.groupName}-${result.key}-${index}`} className="border-b last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60">
                    <td className="px-3 py-3 font-semibold text-gray-900 dark:text-gray-100">{result.groupName}</td>
                    <td className="px-3 py-3">{result.key}</td>
                    <td className="px-3 py-3">{result.value}</td>
                    <td className="px-3 py-3">{result.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"><EmptyState /></div>}
    </div>
  );
}
