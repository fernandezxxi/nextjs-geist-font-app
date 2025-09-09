"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  description: string;
  participant_count: number;
  max_participants: number | null;
  is_full: boolean;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    team_name: '',
    category_id: '',
    description: ''
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost/innovation-day-2025/backend/api/categories.php');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error('Gagal memuat kategori kompetisi');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Terjadi kesalahan saat memuat kategori');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.full_name || 
        !formData.team_name || !formData.category_id) {
      toast.error('Semua field wajib harus diisi');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Format email tidak valid');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost/innovation-day-2025/backend/api/register-participant.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
          team_name: formData.team_name,
          category_id: parseInt(formData.category_id),
          description: formData.description
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Registrasi berhasil! Silakan login dengan akun Anda.');
        router.push('/login');
      } else {
        toast.error(data.error || 'Registrasi gagal');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Terjadi kesalahan saat registrasi');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Innovation Day 2025</h1>
          <p className="text-gray-600">Registrasi Peserta Kompetisi</p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Daftar Sebagai Peserta</CardTitle>
            <CardDescription className="text-center">
              Lengkapi form di bawah untuk mendaftar kompetisi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Username unik"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Nama lengkap Anda"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Competition Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Kompetisi</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="team_name">Nama Tim *</Label>
                  <Input
                    id="team_name"
                    type="text"
                    placeholder="Nama tim Anda"
                    value={formData.team_name}
                    onChange={(e) => handleInputChange('team_name', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori Kompetisi *</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => handleInputChange('category_id', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori kompetisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                          disabled={category.is_full}
                        >
                          <div className="flex flex-col">
                            <span className="capitalize">{category.name}</span>
                            <span className="text-xs text-gray-500">
                              {category.participant_count} peserta
                              {category.max_participants && ` (max: ${category.max_participants})`}
                              {category.is_full && ' - PENUH'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Tim (Opsional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Ceritakan tentang tim dan inovasi Anda..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                  onClick={() => router.push('/login')}
                >
                  Masuk di sini
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
