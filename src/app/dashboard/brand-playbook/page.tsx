'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BrandPlaybookPage() {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  const handleVerify = async () => {
    setIsLoading(true);
    setVerificationStatus(null);
    try {
      const response = await fetch('/api/brand-playbook/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await response.json();
      setVerificationStatus(data);
    } catch (error) {
      setVerificationStatus({ status: 'error', message: 'An unexpected error occurred.' });
    }
    setIsLoading(false);
  };

  const handleRescan = async (brandId: string) => {
    setIsLoading(true);
    try {
        await fetch('/api/brand-playbook/rescan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brandId }),
        });
        // You can add a toast notification here to inform the user
    } catch (error) {
        // Handle error
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Playbook (Pro)</CardTitle>
          <CardDescription>
            Publish a machine-readable brand playbook to give AI models the facts, tone, and context they need.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">1. Download Starter Kit</h3>
            <p className="text-sm text-muted-foreground">
              Get the implementation guide and a sample `aidi-brand.json` file.
            </p>
            <Button className="mt-2" onClick={() => window.open('/aidi-brand-starter-kit.zip', '_blank')}>
              Download Starter Kit (ZIP)
            </Button>
          </div>

          <div>
            <h3 className="font-semibold">2. Publish to Your Site</h3>
            <p className="text-sm text-muted-foreground">
              Place the file at `/.well-known/aidi-brand.json`.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">3. Verify & Re-Score</h3>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="url"
                placeholder="https://yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleVerify} disabled={isLoading || !domain}>
                {isLoading ? 'Verifying...' : 'Verify Installation'}
              </Button>
            </div>
          </div>

          {verificationStatus && (
            <Alert variant={verificationStatus.status === 'valid' ? 'default' : 'destructive'}>
              <AlertTitle>{verificationStatus.status === 'valid' ? 'Success!' : 'Error'}</AlertTitle>
              <AlertDescription>
                {verificationStatus.message}
                {verificationStatus.details && <pre className="mt-2 text-xs">{JSON.stringify(verificationStatus.details, null, 2)}</pre>}
              </AlertDescription>
              {verificationStatus.status === 'valid' && (
                <div className="mt-4">
                  <Button onClick={() => handleRescan(verificationStatus.data.brand_id)} disabled={isLoading}>
                    {isLoading ? 'Scanning...' : 'Re-Scan & Re-Score'}
                  </Button>
                </div>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}