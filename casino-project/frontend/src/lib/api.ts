// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...this.getHeaders(), ...(options.headers || {}) },
    });

    // Try token refresh on 401
    if (res.status === 401) {
      const data = await res.json();
      if (data.code === 'TOKEN_EXPIRED') {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const retry = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { ...this.getHeaders(), ...(options.headers || {}) },
          });
          if (!retry.ok) throw new Error((await retry.json()).message);
          return retry.json();
        }
      }
      throw new Error(data.message || 'غير مصرح');
    }

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'خطأ في الخادم');
    return json;
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        return true;
      }
    } catch {}
    return false;
  }

  // Auth
  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async logout(refreshToken: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Games
  async playSlots(betAmount: number, clientSeed: string, slotType: string = 'fruits') {
    return this.request<any>('/games/slots', {
      method: 'POST',
      body: JSON.stringify({ betAmount, clientSeed, slotType }),
    });
  }

  async startCrash(betAmount: number, clientSeed: string, autoCashout?: number) {
    return this.request<any>('/games/crash/start', {
      method: 'POST',
      body: JSON.stringify({ betAmount, clientSeed, autoCashout }),
    });
  }

  async cashoutCrash(multiplier: number) {
    return this.request<any>('/games/crash/cashout', {
      method: 'POST',
      body: JSON.stringify({ multiplier }),
    });
  }

  async playRoulette(bets: any[], clientSeed: string) {
    return this.request<any>('/games/roulette', {
      method: 'POST',
      body: JSON.stringify({ bets, clientSeed }),
    });
  }

  async startMines(betAmount: number, mineCount: number, clientSeed: string) {
    return this.request<any>('/games/mines/start', {
      method: 'POST',
      body: JSON.stringify({ betAmount, mineCount, clientSeed }),
    });
  }

  async revealMineCell(cellIndex: number) {
    return this.request<any>('/games/mines/reveal', {
      method: 'POST',
      body: JSON.stringify({ cellIndex }),
    });
  }

  async cashoutMines() {
    return this.request<any>('/games/mines/cashout', { method: 'POST' });
  }

  async getGameHistory(page = 1) {
    return this.request<any>(`/games/history?page=${page}`);
  }

  async getLeaderboard() {
    return this.request<any>('/games/leaderboard');
  }

  // Points
  async claimDailyBonus() {
    return this.request<any>('/points/daily', { method: 'POST' });
  }

  async getVideos() {
    return this.request<any>('/points/videos');
  }

  async watchVideo(videoId: string, watchDuration: number) {
    return this.request<any>('/points/videos/watch', {
      method: 'POST',
      body: JSON.stringify({ videoId, watchDuration }),
    });
  }

  async getTasks() {
    return this.request<any>('/points/tasks');
  }

  async completeTask(taskId: string) {
    return this.request<any>('/points/tasks/complete', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });
  }

  async getPointsHistory() {
    return this.request<any>('/points/history');
  }

  // Gifts
  async getGifts() {
    return this.request<any>('/gifts');
  }

  async redeemGift(giftId: string, discordUsername?: string) {
    return this.request<any>('/gifts/redeem', {
      method: 'POST',
      body: JSON.stringify({ giftId, discordUsername }),
    });
  }

  async getMyRedemptions() {
    return this.request<any>('/gifts/my-redemptions');
  }
}

export const api = new ApiService();
