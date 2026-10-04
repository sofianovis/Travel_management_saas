export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const selectedBranch = typeof window !== 'undefined' ? localStorage.getItem('selectedBranchId') : null;
  
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let finalUrl = input.toString();
  if (selectedBranch && (!init?.method || init?.method === 'GET')) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}branchId=${selectedBranch}`;
  }

  const response = await fetch(finalUrl, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return response;
}
