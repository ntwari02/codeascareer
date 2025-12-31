import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import {
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Upload,
  Send,
  FileText,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  FileCheck,
  Plus,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
  X,
  Store,
  Eye,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const API_BASE = 'http://localhost:5000/api/buyer/disputes';

interface DisputeEvidence {
  type: 'photo' | 'document' | 'message' | 'receipt' | 'video' | 'other';
  url: string;
  description?: string;
  uploadedAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface Seller {
  _id: string;
  fullName?: string;
  email?: string;
  storeName?: string;
}

interface Dispute {
  _id: string;
  disputeNumber: string;
  orderId: Order | string;
  sellerId: Seller | string;
  type: 'refund' | 'return' | 'quality' | 'delivery' | 'other';
  reason: string;
  description: string;
  status: 'new' | 'under_review' | 'seller_response' | 'buyer_response' | 'approved' | 'rejected' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence: DisputeEvidence[];
  sellerResponse?: string;
  sellerResponseAt?: string;
  buyerResponse?: string;
  buyerResponseAt?: string;
  adminDecision?: string;
  adminDecisionAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  responseDeadline?: string;
}

export function Disputes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const { user } = useAuthStore();
  const { showToast } = useToastStore();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDisputeDetails, setShowDisputeDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Create dispute form state
  const [newDispute, setNewDispute] = useState({
    orderId: orderIdParam || '',
    type: 'refund' as 'refund' | 'return' | 'quality' | 'delivery' | 'other',
    reason: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Fetch disputes
  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch disputes' }));
        throw new Error(errorData.message || 'Failed to fetch disputes');
      }

      const data = await response.json();
      setDisputes(data.disputes || []);

      // If orderId param is set and no dispute exists, open create modal
      if (orderIdParam && data.disputes && data.disputes.length === 0) {
        setShowCreateModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching disputes:', error);
      showToast(error.message || 'Failed to load disputes', 'error');
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, navigate, showToast, orderIdParam]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  // Load available orders for creating dispute
  const loadAvailableOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Create dispute
  const handleCreateDispute = async () => {
    if (!newDispute.orderId || !newDispute.reason || !newDispute.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // First create the dispute
      const createResponse = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId: newDispute.orderId,
          type: newDispute.type,
          reason: newDispute.reason,
          description: newDispute.description,
          priority: newDispute.priority,
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.message || 'Failed to create dispute');
      }

      const createData = await createResponse.json();
      const disputeId = createData.dispute._id;

      // Upload evidence files if any
      if (evidenceFiles.length > 0 && disputeId) {
        const formData = new FormData();
        evidenceFiles.forEach(file => {
          formData.append('files', file);
        });

        try {
          await fetch(`${API_BASE}/${disputeId}/evidence`, {
            method: 'POST',
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include',
            body: formData,
          });
        } catch (evidenceError) {
          console.error('Error uploading evidence:', evidenceError);
          // Don't fail the whole dispute creation if evidence upload fails
        }
      }

      showToast('Dispute created successfully', 'success');
      setShowCreateModal(false);
      setNewDispute({
        orderId: '',
        type: 'refund',
        reason: '',
        description: '',
        priority: 'medium',
      });
      setEvidenceFiles([]);
      await fetchDisputes();
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      showToast(error.message || 'Failed to create dispute', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch dispute details
  const fetchDisputeDetails = async (disputeId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/${disputeId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch dispute details');
      const data = await response.json();
      setSelectedDispute(data.dispute);
    } catch (error) {
      console.error('Error fetching dispute details:', error);
      showToast('Failed to load dispute details', 'error');
    }
  };

  // Submit buyer response
  const handleSubmitResponse = async () => {
    if (!selectedDispute || !responseText.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/${selectedDispute._id}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit response');
      }

      showToast('Response submitted successfully', 'success');
      setShowResponseModal(false);
      setResponseText('');
      await fetchDisputeDetails(selectedDispute._id);
      await fetchDisputes();
    } catch (error: any) {
      console.error('Error submitting response:', error);
      showToast(error.message || 'Failed to submit response', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Upload evidence
  const handleUploadEvidence = async () => {
    if (!selectedDispute || evidenceFiles.length === 0) return;

    setUploadingEvidence(true);
    try {
      const formData = new FormData();
      evidenceFiles.forEach(file => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/${selectedDispute._id}/evidence`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload evidence');
      }

      showToast('Evidence uploaded successfully', 'success');
      setShowEvidenceModal(false);
      setEvidenceFiles([]);
      await fetchDisputeDetails(selectedDispute._id);
      await fetchDisputes();
    } catch (error: any) {
      console.error('Error uploading evidence:', error);
      showToast(error.message || 'Failed to upload evidence', 'error');
    } finally {
      setUploadingEvidence(false);
    }
  };

  // Filter disputes
  const filteredDisputes = useMemo(() => {
    let filtered = [...disputes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(dispute => {
        const order = typeof dispute.orderId === 'object' ? dispute.orderId : null;
        return (
          dispute.disputeNumber.toLowerCase().includes(term) ||
          (order?.orderNumber || '').toLowerCase().includes(term) ||
          dispute.reason.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [disputes, searchTerm]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      'new': { label: 'New', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle },
      'seller_response': { label: 'Seller Responded', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Clock },
      'buyer_response': { label: 'Your Response', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
      'under_review': { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: MessageSquare },
      'resolved': { label: 'Resolved', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
      'approved': { label: 'Approved', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
      'rejected': { label: 'Rejected', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
    };
    return statusMap[status] || statusMap['new'];
  };

  // Get dispute amount
  const getDisputeAmount = (dispute: Dispute) => {
    const order = typeof dispute.orderId === 'object' ? dispute.orderId : null;
    return order?.total || 0;
  };

  // Get file URL
  const getFileUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const serverBase = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${serverBase}${path.startsWith('/') ? path : '/' + path}`;
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Disputes & Claims
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                File a dispute for orders that didn't meet your expectations
              </p>
            </div>
            <Button
              onClick={() => {
                loadAvailableOrders();
                setShowCreateModal(true);
              }}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              File New Dispute
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="seller_response">Seller Responded</option>
                  <option value="buyer_response">Your Response</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Types</option>
                  <option value="refund">Refund</option>
                  <option value="return">Return</option>
                  <option value="quality">Quality Issue</option>
                  <option value="delivery">Delivery Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Disputes List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Disputes Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No disputes match your filters'
                : "You haven't filed any disputes yet"}
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
              <Button
                onClick={() => {
                  loadAvailableOrders();
                  setShowCreateModal(true);
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                File Your First Dispute
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => {
              const statusBadge = getStatusBadge(dispute.status);
              const StatusIcon = statusBadge.icon;
              const order = typeof dispute.orderId === 'object' ? dispute.orderId : null;
              const seller = typeof dispute.sellerId === 'object' ? dispute.sellerId : null;

              return (
                <div
                  key={dispute._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {dispute.disputeNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${statusBadge.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusBadge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Package className="h-4 w-4" />
                            <span>Order: {order?.orderNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Store className="h-4 w-4" />
                            <span>Seller: {seller?.storeName || seller?.fullName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4" />
                            <span>Amount: {formatCurrency(getDisputeAmount(dispute))}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <p className="font-medium mb-1">Type: {dispute.type.charAt(0).toUpperCase() + dispute.type.slice(1)}</p>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{dispute.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await fetchDisputeDetails(dispute._id);
                            setShowDisputeDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {dispute.status === 'seller_response' && (
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={async () => {
                              await fetchDisputeDetails(dispute._id);
                              setShowResponseModal(true);
                            }}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Create Dispute Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">File a Dispute</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Select Order *
              </label>
              {loadingOrders ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                </div>
              ) : (
                <select
                  value={newDispute.orderId}
                  onChange={(e) => setNewDispute({ ...newDispute, orderId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select an order...</option>
                  {availableOrders.map((order: any) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {formatCurrency(order.total)} - {new Date(order.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Dispute Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Dispute Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['refund', 'return', 'quality', 'delivery', 'other'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewDispute({ ...newDispute, type: type as any })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      newDispute.type === type
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{type}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Reason *
              </label>
              <input
                type="text"
                value={newDispute.reason}
                onChange={(e) => setNewDispute({ ...newDispute, reason: e.target.value })}
                placeholder="Brief reason for dispute..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Description *
              </label>
              <textarea
                value={newDispute.description}
                onChange={(e) => setNewDispute({ ...newDispute, description: e.target.value })}
                placeholder="Provide detailed description of the issue..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Priority
              </label>
              <select
                value={newDispute.priority}
                onChange={(e) => setNewDispute({ ...newDispute, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Upload Evidence (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload photos, documents, or videos to support your dispute
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,video/*"
                  onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
                  className="hidden"
                  id="evidence-upload"
                />
                <label
                  htmlFor="evidence-upload"
                  className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                  Choose Files
                </label>
                {evidenceFiles.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {evidenceFiles.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDispute}
                disabled={submitting || !newDispute.orderId || !newDispute.reason || !newDispute.description}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Dispute
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Details Modal */}
      <Dialog open={showDisputeDetails} onOpenChange={setShowDisputeDetails}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Dispute Details: {selectedDispute?.disputeNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-6">
              {/* Dispute Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {typeof selectedDispute.orderId === 'object' ? selectedDispute.orderId.orderNumber : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dispute Amount</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(getDisputeAmount(selectedDispute))}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedDispute.type}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedDispute.status).color}`}>
                    {getStatusBadge(selectedDispute.status).label}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedDispute.description}</p>
              </div>

              {/* Seller Response */}
              {selectedDispute.sellerResponse && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Seller Response</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedDispute.sellerResponse}</p>
                  {selectedDispute.sellerResponseAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(selectedDispute.sellerResponseAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Evidence */}
              {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Evidence</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedDispute.evidence.map((evidence, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {evidence.type === 'photo' ? (
                          <img
                            src={getFileUrl(evidence.url)}
                            alt={evidence.description || 'Evidence'}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {evidence.description || 'Evidence'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedDispute.status === 'seller_response' && (
                  <>
                    <Button
                      onClick={() => setShowResponseModal(true)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Respond to Seller
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEvidenceModal(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Evidence
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowDisputeDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Type your response..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowResponseModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResponse}
                disabled={submitting || !responseText.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Response
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Evidence Upload Modal */}
      <Dialog open={showEvidenceModal} onOpenChange={setShowEvidenceModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Upload photos, documents, or videos
              </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,video/*"
                  onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
                  className="hidden"
                  id="evidence-upload-modal"
                />
              <label
                htmlFor="evidence-upload-modal"
                className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                Choose Files
              </label>
              {evidenceFiles.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {evidenceFiles.length} file(s) selected
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEvidenceModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadEvidence}
                disabled={uploadingEvidence || evidenceFiles.length === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {uploadingEvidence ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Evidence
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

