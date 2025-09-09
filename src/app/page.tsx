"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'committee':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/committee/participants')}>
                <CardHeader>
                  <CardTitle>Kelola Peserta</CardTitle>
                  <CardDescription>Lihat dan kelola pendaftaran peserta</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/committee/judges')}>
                <CardHeader>
                  <CardTitle>Kelola Juri</CardTitle>
                  <CardDescription>Atur juri dan kategori penilaian</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/committee/results')}>
                <CardHeader>
                  <CardTitle>Hasil Kompetisi</CardTitle>
                  <CardDescription>Lihat hasil dan ranking peserta</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        );
      
      case 'judge':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Panel Juri</CardTitle>
                <CardDescription>
                  Kategori: <Badge variant="secondary">{user.judge_category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/judge/scoring')} className="w-full">
                  Mulai Penilaian
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'participant':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Peserta</CardTitle>
                <CardDescription>
                  Tim: {user.participant_info?.team_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Kategori:</p>
                    <Badge variant="outline">{user.participant_info?.category_name}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tahap Saat Ini:</p>
                    <Badge>{user.participant_info?.stage}</Badge>
                  </div>
                  <Button onClick={() => router.push('/participant/status')} className="w-full">
                    Lihat Detail Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return <div>Role tidak dikenali</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Innovation Day 2025</h1>
              <p className="text-sm text-gray-600">Platform Kompetisi</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/profile')}
              >
                Profil
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang, {user?.full_name}
          </h2>
          <p className="text-gray-600">
            {user?.role === 'committee' && 'Kelola kompetisi Innovation Day 2025'}
            {user?.role === 'judge' && 'Berikan penilaian terbaik untuk peserta'}
            {user?.role === 'participant' && 'Pantau perkembangan kompetisi Anda'}
          </p>
        </div>

        {getDashboardContent()}
      </main>
    </div>
  );
}
