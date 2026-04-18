import { Award, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import type { Credential } from "@/types";

interface CredentialsTableProps {
  credentials: Credential[];
}

export function CredentialsTable({ credentials }: CredentialsTableProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Verification ledger</CardTitle>
          <CardDescription>
            Track provider trust signals, partner attestations, and recent
            validation events in one enterprise-ready table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last checked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.map((credential) => (
                <TableRow key={credential.id}>
                  <TableCell className="font-medium">{credential.subject}</TableCell>
                  <TableCell>{credential.issuer}</TableCell>
                  <TableCell>{credential.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        credential.status === "Verified"
                          ? "success"
                          : credential.status === "Pending Review"
                            ? "warning"
                            : "outline"
                      }
                    >
                      {credential.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(credential.lastChecked)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-700" />
              Trust posture
            </CardTitle>
            <CardDescription>
              Verification coverage across clinicians, labs, and claims flows.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-3xl bg-slate-950 p-5 text-slate-50">
              <p className="text-sm text-slate-400">Verified sources</p>
              <p className="mt-2 text-4xl font-semibold">
                {
                  credentials.filter((credential) => credential.status === "Verified")
                    .length
                }
              </p>
            </div>
            <div className="panel-muted p-5">
              <p className="text-sm text-slate-500">Pending attention</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {
                  credentials.filter(
                    (credential) => credential.status !== "Verified"
                  ).length
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              Control notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              All issued credentials should be revalidated after role change,
              annual renewal, or upstream compliance exception.
            </p>
            <p>
              Consider pairing the `profiles` table with an audit log table if
              you need immutable evidence of verification lifecycle changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
