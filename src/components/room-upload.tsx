"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { ROOM_TYPE_LABELS, type Product, type RoomAnalysisResult, type RoomType } from "@/lib/types";
import { CATEGORY_LABELS, type ProductCategory } from "@/lib/types";

type ScoredProduct = Product & { explanation: string; score: number };

export function RoomUpload() {
  const [roomType, setRoomType] = useState<RoomType>("living_room");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoomAnalysisResult | null>(null);
  const [analysisRoomType, setAnalysisRoomType] = useState<RoomType | null>(null);
  const [recommendations, setRecommendations] = useState<ScoredProduct[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    color: "",
    style: "",
  });

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : preview), [file, preview]);

  async function runAnalysis() {
    if (!file) {
      toast.error("Choose a room photo first.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("roomType", roomType);
      const res = await fetch("/api/room/analyze", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysisId(data.analysisId);
      setAnalysis(data.analysis);
      setAnalysisRoomType(roomType);
      setRecommendations(data.recommendations);
      setPreview(data.imagePath);
      if (data.lowConfidence) {
        toast.message("Photo quality is low", {
          description: "Try a brighter, wider shot or adjust filters below.",
        });
      } else {
        toast.success("Room analysis complete");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function refine() {
    if (!analysisId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/room/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId,
          roomType: analysisRoomType ?? roomType,
          analysis,
          category: filters.category || undefined,
          minPriceCents: filters.minPrice ? Number(filters.minPrice) * 100 : undefined,
          maxPriceCents: filters.maxPrice ? Number(filters.maxPrice) * 100 : undefined,
          color: filters.color || undefined,
          style: filters.style || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not refine");
      setRecommendations(data.recommendations);
      toast.success("Recommendations updated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle>Upload your room</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Room type</Label>
              <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {ROOM_TYPE_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-photo">Photo (JPG/PNG, max 10MB)</Label>
              <Input
                id="room-photo"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => {
                  const next = e.target.files?.[0] ?? null;
                  setFile(next);
                  if (next) setPreview(URL.createObjectURL(next));
                }}
              />
            </div>
            {previewUrl && (
              <div className="relative aspect-video overflow-hidden rounded-lg border">
                <Image src={previewUrl} alt="Room preview" fill className="object-cover" unoptimized />
              </div>
            )}
            <Button onClick={runAnalysis} disabled={loading || !file} className="w-full">
              {loading ? "Analyzing your room…" : "Analyze & get recommendations"}
            </Button>
          </div>
          <div className="space-y-3 text-sm text-stone-700">
            <p>
              Upload a clear photo of your room. Our AI estimates colours, style, and free space—
              measurements from photos are <strong>approximate</strong>, not exact dimensions.
            </p>
            {analysis && (
              <div className="rounded-lg bg-stone-100 p-4">
                <p className="font-medium text-stone-900">{analysis.userFacingSummary}</p>
                <ul className="mt-2 list-inside list-disc text-stone-600">
                  <li>Style: {analysis.interiorStyle}</li>
                  <li>Space: {analysis.freeSpaceEstimate}</li>
                  <li>Confidence: {analysis.confidence}</li>
                </ul>
                {analysis.confidence === "low" && (
                  <p className="mt-2 text-amber-900">
                    This image is unclear—upload another photo or refine with filters below.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {analysisId && (
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle>Refine recommendations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <Select
              value={filters.category || "all"}
              onValueChange={(v) => setFilters((f) => ({ ...f, category: v === "all" ? "" : (v ?? "") }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Min £"
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            />
            <Input
              placeholder="Max £"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            />
            <Input
              placeholder="Colour"
              value={filters.color}
              onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value }))}
            />
            <Button variant="secondary" onClick={refine} disabled={loading}>
              Apply filters
            </Button>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-stone-900">Recommended for your room</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product as Product} explanation={product.explanation} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}