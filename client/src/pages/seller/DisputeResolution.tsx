import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MessageSquare, CheckCircle, XCircle, Clock, Search, Filter, Upload, Send, Image as ImageIcon, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Dispute {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  date: string;
  priority: 'low' | 'medium' | 'high';
  evidence?: { type: 'image' | 'video'; url: string }[];
  messages?: { sender: 'buyer' | 'seller' | 'platform'; text: string; date: string }[];
  platformDecision?: string;
}

const DisputeResolution: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDisputeDetails, setShowDisputeDetails] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  const [disputes] = useState<Dispute[]>([
    {
      id: '1',
      orderNumber: 'ORD-2847',
      customer: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      reason: 'Item not as described',
      description: 'The product I received does not match the description. The color is different and the quality is lower than expected.',
      status: 'open',
      date: '2024-01-15',
      priority: 'high',
      evidence: [
        { type: 'image', url: 'https://via.placeholder.com/300' },
        { type: 'image', url: 'https://via.placeholder.com/300' },
      ],
      messages: [
        { sender: 'buyer', text: 'I received the wrong item. Please help resolve this.', date: '2024-01-15 10:30 AM' },
      ],
    },
    {
      id: '2',
      orderNumber: 'ORD-2840',
      customer: 'Bob Smith',
      customerEmail: 'bob@example.com',
      reason: 'Late delivery',
      description: 'My order was supposed to arrive on January 10th but it arrived on January 14th, 4 days late.',
      status: 'under_review',
      date: '2024-01-14',
      priority: 'medium',
      messages: [
        { sender: 'buyer', text: 'The delivery was very late.', date: '2024-01-14 09:15 AM' },
        { sender: 'seller', text: 'We apologize for the delay. We are investigating with the shipping carrier.', date: '2024-01-14 02:30 PM' },
        { sender: 'platform', text: 'This dispute is under review by our support team.', date: '2024-01-14 03:00 PM' },
      ],
    },
    {
      id: '3',
      orderNumber: 'ORD-2835',
      customer: 'Carol White',
      customerEmail: 'carol@example.com',
      reason: 'Damaged item',
      description: 'The item arrived damaged. The packaging was torn and the product inside was broken.',
      status: 'resolved',
      date: '2024-01-10',
      priority: 'high',
      evidence: [
        { type: 'image', url: 'https://via.placeholder.com/300' },
      ],
      messages: [
        { sender: 'buyer', text: 'Item arrived damaged.', date: '2024-01-10 11:00 AM' },
        { sender: 'seller', text: 'We will send a replacement immediately.', date: '2024-01-10 01:00 PM' },
        { sender: 'platform', text: 'Dispute resolved. Replacement sent.', date: '2024-01-10 03:00 PM' },
      ],
      platformDecision: 'Resolved in favor of buyer. Replacement sent.',
    },
  ]);

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || dispute.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const openDisputes = disputes.filter(d => d.status === 'open').length;
  const underReview = disputes.filter(d => d.status === 'under_review').length;
  const resolved = disputes.filter(d => d.status === 'resolved').length;
  const rejected = disputes.filter(d => d.status === 'rejected').length;
  const disputeRate = ((disputes.length / 100) * 100).toFixed(2); // Mock calculation
  const winRate = ((resolved / disputes.length) * 100).toFixed(1); // Mock calculation

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Clock;
      case 'under_review': return MessageSquare;
      case 'resolved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'under_review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleViewDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowDisputeDetails(true);
  };

  const handleSendResponse = () => {
    if (selectedDispute && responseText.trim()) {
      // Implementation would send message
      console.log('Send response:', responseText);
      setResponseText('');
    }
  };

  const handleAddEvidence = () => {
    setShowEvidenceModal(true);
  };

  const handleRequestPlatformSupport = () => {
    // Implementation would request platform support
    console.log('Request platform support');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            Dispute Resolution
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Manage customer disputes and resolve issues</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">Open Disputes</p>
          <p className="text-3xl font-bold text-red-500 dark:text-red-400 transition-colors duration-300">{openDisputes}</p>
        </div>
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">Under Review</p>
          <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400 transition-colors duration-300">{underReview}</p>
        </div>
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">Resolved</p>
          <p className="text-3xl font-bold text-green-500 dark:text-green-400 transition-colors duration-300">{resolved}</p>
        </div>
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">Rejected</p>
          <p className="text-3xl font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300">{rejected}</p>
        </div>
      </div>

      {/* Resolution Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">Dispute Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{disputeRate}%</p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{winRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">Total Disputes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{disputes.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700/30 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by order ID, customer, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Disputes</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Disputes List */}
        <div className="space-y-4">
          {filteredDisputes.map((dispute, index) => {
            const StatusIcon = getStatusIcon(dispute.status);
            return (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700/50 hover:border-red-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                      <StatusIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">{dispute.orderNumber}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(dispute.status)} font-medium capitalize`}>
                          {dispute.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(dispute.priority)} font-medium`}>
                          {dispute.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">{dispute.customer}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 transition-colors duration-300">
                        <span className="font-semibold">Reason:</span> {dispute.reason}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs transition-colors duration-300">Opened on {dispute.date}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => handleViewDispute(dispute)}
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dispute Details Dialog */}
      <Dialog open={showDisputeDetails} onOpenChange={setShowDisputeDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Dispute Details - {selectedDispute?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6 mt-4">
              {/* Buyer Complaint */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Buyer Complaint</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Reason:</span> {selectedDispute.reason}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedDispute.description}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs">Customer: {selectedDispute.customer} ({selectedDispute.customerEmail})</p>
                </div>
              </div>

              {/* Evidence */}
              {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-red-400" />
                    Evidence
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedDispute.evidence.map((ev, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={ev.url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {selectedDispute.messages && selectedDispute.messages.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Messages</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedDispute.messages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${
                        msg.sender === 'seller' ? 'bg-red-50 dark:bg-red-900/20 ml-4' :
                        msg.sender === 'platform' ? 'bg-blue-50 dark:bg-blue-900/20' :
                        'bg-gray-100 dark:bg-gray-700 mr-4'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{msg.sender}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">{msg.date}</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Decision */}
              {selectedDispute.platformDecision && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-500/30">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Decision</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDispute.platformDecision}</p>
                </div>
              )}

              {/* Seller Actions */}
              {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'rejected' && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Respond to Buyer
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response..."
                      rows={4}
                      className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleSendResponse}
                      disabled={!responseText.trim()}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Response
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleAddEvidence}
                      className="border-gray-300 dark:border-gray-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add Evidence
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleRequestPlatformSupport}
                      className="border-gray-300 dark:border-gray-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Request Platform Support
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Evidence Modal */}
      <Dialog open={showEvidenceModal} onOpenChange={setShowEvidenceModal}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Add Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Photos/Videos
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here, or click to browse</p>
                <Button variant="outline" className="border-gray-300 dark:border-gray-700">
                  Select Files
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEvidenceModal(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisputeResolution;
