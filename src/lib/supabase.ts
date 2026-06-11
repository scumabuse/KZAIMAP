import { createClient } from '@supabase/supabase-js';
import type { Report, Profile, Stats } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Reports ────────────────────────────────────────────────────────────────

export async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Report[]) ?? [];
}

export async function getReportById(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Report;
}

export async function createReport(payload: {
  user_id: string;
  photo_url: string | null;
  description: string;
  latitude: number;
  longitude: number;
}): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert([{ ...payload, status: 'pending' }])
    .select()
    .single();
  if (error) throw error;
  return data as Report;
}

export async function updateReportStatus(
  id: string,
  status: 'pending' | 'verified' | 'rejected'
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from('reports').delete().eq('id', id);
  if (error) throw error;
}

export async function updateReportAI(
  id: string,
  ai: {
    ai_is_dump: boolean;
    ai_confidence: number;
    ai_pollution_level: string;
    ai_waste_types: string[];
    ai_hazardous: boolean;
    risk_score: number;
    status: string;
  }
): Promise<void> {
  const { error } = await supabase.from('reports').update(ai).eq('id', id);
  if (error) throw error;
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export async function getStats(): Promise<Stats> {
  const { data, error } = await supabase.from('reports').select('*');
  if (error) throw error;
  const reports = (data as Report[]) ?? [];
  return {
    total: reports.length,
    verified: reports.filter((r) => r.status === 'verified').length,
    hazardous: reports.filter((r) => r.ai_hazardous === true).length,
    high_pollution: reports.filter((r) => r.ai_pollution_level === 'high').length,
  };
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export async function uploadPhoto(
  file: File,
  userId: string
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('dump-photos')
    .upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('dump-photos').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Profile;
}

// ─── Edge Function ───────────────────────────────────────────────────────────

export async function analyzeImageEdge(
  reportId: string,
  imageUrl: string
): Promise<void> {
  const { error } = await supabase.functions.invoke('analyze-image', {
    body: { reportId, imageUrl },
  });
  if (error) throw error;
}
