'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  FileText,
  DollarSign,
  Send,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoice_pdf_url?: string;
  hosted_invoice_url?: string;
  due_date?: string;
  paid_at?: string;
  description?: string;
  line_items: LineItem[];
  created_at: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesRes, usersRes, tiersRes] = await Promise.all([
        fetch('/api/admin/invoices'),
        fetch('/api/admin/users?limit=1000'),
        fetch('/api/admin/tiers')
      ]);
      const invoicesData = await invoicesRes.json();
      const usersData = await usersRes.json();
      const tiersData = await tiersRes.json();
      setInvoices(invoicesData.invoices || []);
      setUsers(usersData.users || []);
      setTiers(tiersData.tiers || []);
    } catch (error) {
      console.error('Failed to load invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvoice = async (invoiceId: string) => {
    if (!confirm('Send this invoice to customer via Stripe?')) return;
    
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('Invoice sent successfully!');
        await loadData();
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
      alert('Failed to send invoice');
    }
  };

  const filteredInvoices = filterStatus === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'void': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'open': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading invoices...</div>;
  }

  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Invoice Management</h2>
            <p className="text-gray-600 mt-1">Create and manage branded invoices with Stripe</p>
          </div>
          <Button onClick={() => setView('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">{invoices.length}</div>
            <div className="text-sm text-gray-600">Total Invoices</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-gray-600">
              {invoices.filter(i => i.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">
              {invoices.filter(i => i.status === 'open').length}
            </div>
            <div className="text-sm text-gray-600">Open</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(i => i.status === 'paid').length}
            </div>
            <div className="text-sm text-gray-600">Paid</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">
              £{invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount_paid, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['all', 'draft', 'open', 'paid', 'void'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filterStatus === status ? 'default' : 'outline'}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${invoices.filter(i => i.status === status).length})`}
            </Button>
          ))}
        </div>

        {/* Invoices List */}
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1">{invoice.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="font-medium">{invoice.user_name || invoice.user_email}</div>
                    <div>{invoice.description}</div>
                    {invoice.due_date && invoice.status === 'open' && (
                      <div className="text-orange-600">
                        Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    {invoice.paid_at && (
                      <div className="text-green-600">
                        Paid: {format(new Date(invoice.paid_at), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {invoice.currency} £{invoice.amount_due.toLocaleString()}
                  </div>
                  {invoice.amount_paid > 0 && invoice.amount_paid < invoice.amount_due && (
                    <div className="text-sm text-gray-600">
                      £{invoice.amount_paid.toLocaleString()} paid
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items */}
              {invoice.line_items && invoice.line_items.length > 0 && (
                <div className="mb-4 pb-4 border-t pt-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">LINE ITEMS:</div>
                  {invoice.line_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>{item.description} {item.quantity > 1 && `(×${item.quantity})`}</span>
                      <span>£{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {invoice.status === 'draft' && (
                  <Button size="sm" onClick={() => sendInvoice(invoice.id)}>
                    <Send className="h-4 w-4 mr-1" />
                    Send via Stripe
                  </Button>
                )}
                {invoice.invoice_pdf_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={invoice.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </a>
                  </Button>
                )}
                {invoice.hosted_invoice_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {filterStatus === 'all' ? 'No invoices yet' : `No ${filterStatus} invoices`}
            </p>
            {filterStatus === 'all' && (
              <Button className="mt-4" onClick={() => setView('create')}>
                Create First Invoice
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === 'create') {
    return <InvoiceCreator
      users={users}
      tiers={tiers}
      onSave={async () => {
        await loadData();
        setView('list');
      }}
      onCancel={() => setView('list')}
    />;
  }

  return null;
}

function InvoiceCreator({
  users,
  tiers,
  onSave,
  onCancel
}: {
  users: any[];
  tiers: any[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [selectedUser, setSelectedUser] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const addLineItem = (item: Partial<LineItem>) => {
    setLineItems([...lineItems, {
      description: item.description || '',
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      amount: (item.quantity || 1) * (item.unit_price || 0)
    }]);
  };

  const addTierAsLineItem = (tierId: string) => {
    const tier = tiers.find(t => t.id === tierId);
    if (tier) {
      addLineItem({
        description: tier.tier_name,
        quantity: 1,
        unit_price: tier.price_amount,
      });
    }
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const handleCreate = async () => {
    if (!selectedUser || lineItems.length === 0) {
      alert('Please select a customer and add at least one line item');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser,
          line_items: lineItems,
          due_date: dueDate || null,
          description: description || null
        })
      });

      if (response.ok) {
        onSave();
      } else {
        alert('Failed to create invoice');
      }
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create Invoice</h2>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Customer Selection */}
        <div>
          <Label>Select Customer</Label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border rounded mt-2"
          >
            <option value="">Choose customer...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} {user.profile?.company_name && `(${user.profile.company_name})`}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Add from Tiers */}
        <div>
          <Label>Quick Add from Pricing Tiers</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {tiers.filter(t => t.is_active).map((tier) => (
              <Button
                key={tier.id}
                size="sm"
                variant="outline"
                onClick={() => addTierAsLineItem(tier.id)}
              >
                {tier.tier_name} - £{tier.price_amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Line Items</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addLineItem({ description: 'Custom item', quantity: 1, unit_price: 0 })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Custom Item
            </Button>
          </div>
          
          <div className="space-y-2">
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 border rounded">
                <Input
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...lineItems];
                    newItems[idx].description = e.target.value;
                    setLineItems(newItems);
                  }}
                  placeholder="Description"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...lineItems];
                    newItems[idx].quantity = parseInt(e.target.value) || 1;
                    newItems[idx].amount = newItems[idx].quantity * newItems[idx].unit_price;
                    setLineItems(newItems);
                  }}
                  className="w-20"
                  min="1"
                />
                <span className="text-gray-400">×</span>
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => {
                    const newItems = [...lineItems];
                    newItems[idx].unit_price = parseFloat(e.target.value) || 0;
                    newItems[idx].amount = newItems[idx].quantity * newItems[idx].unit_price;
                    setLineItems(newItems);
                  }}
                  className="w-32"
                  placeholder="0.00"
                  step="0.01"
                />
                <div className="w-32 text-right font-semibold">
                  £{item.amount.toFixed(2)}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeLineItem(idx)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end items-center gap-4 pt-4 border-t mt-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">£{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Due Date (optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Custom evaluation services"
              className="mt-2"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleCreate} disabled={saving || !selectedUser || lineItems.length === 0}>
            <FileText className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create Invoice'}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

