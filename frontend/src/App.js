import React, { useState, useEffect } from 'react';
import { clientsAPI, transactionsAPI, invoicesAPI } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientStatement, setClientStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [newClient, setNewClient] = useState({ 
    name: '', 
    wechatId: '', 
    email: '', 
    phone: '' 
  });
  
  const [newTransaction, setNewTransaction] = useState({
    client: '',
    type: 'debit',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientsRes, transactionsRes, invoicesRes] = await Promise.all([
        clientsAPI.getAll(),
        transactionsAPI.getAll(),
        invoicesAPI.getAll()
      ]);
      setClients(clientsRes.data);
      setTransactions(transactionsRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Make sure backend is running on port 4000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await clientsAPI.create(newClient);
      setNewClient({ name: '', wechatId: '', email: '', phone: '' });
      await loadData();
    } catch (error) {
      console.error('Error adding client:', error);
      setError('Failed to add client. Please check the form.');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newTransaction.client) {
      setError('Please select a client');
      return;
    }
    
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await transactionsAPI.create({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });
      setNewTransaction({
        client: '',
        type: 'debit',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      await loadData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError('Failed to add transaction. Please check the form.');
    }
  };

  const handleViewStatement = async (clientId) => {
    setLoading(true);
    setError('');
    try {
      const clientResponse = await clientsAPI.getById(clientId);
      const transactionsResponse = await transactionsAPI.getByClient(clientId);
      
      setSelectedClient(clientResponse.data);
      setClientStatement({
        client: clientResponse.data,
        transactions: transactionsResponse.data,
        summary: {
          totalTransactions: transactionsResponse.data.length,
          currentBalance: clientResponse.data.balance
        }
      });
      setActiveTab('statement');
    } catch (error) {
      console.error('Error loading statement:', error);
      setError('Failed to load client statement.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await invoicesAPI.exportExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'invoices.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError('Failed to export data.');
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      await invoicesAPI.updateStatus(invoiceId, 'paid');
      await loadData();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      setError('Failed to update invoice status.');
    }
  };

  const handleCreateInvoice = async (clientId) => {
    try {
      const unbilledTransactions = await transactionsAPI.getUnbilled();
      const clientUnbilled = unbilledTransactions.data.filter(
        t => t.client._id === clientId && !t.billed
      );

      if (clientUnbilled.length === 0) {
        setError('No unbilled transactions found for this client.');
        return;
      }

      const total = clientUnbilled.reduce((sum, t) => sum + t.amount, 0);
      const invoiceNumber = `INV-${Date.now()}`;
      
      const invoiceData = {
        invoiceNumber,
        client: clientId,
        transactions: clientUnbilled.map(t => t._id),
        items: clientUnbilled.map(t => ({
          description: t.description,
          amount: t.amount
        })),
        total,
        date: new Date().toISOString(),
        status: 'draft'
      };

      await invoicesAPI.create(invoiceData);
      await loadData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice.');
    }
  };

  return (
    <div className="App">
      <header>
        <div className="container brand">
          <div className="avatar">FG</div>
          <div className="title">Fusion Global </div>
          <div className="tabs">
            {['dashboard', 'clients', 'transactions', 'invoices', 'statement', 'activity'].map(tab => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  setError('');
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="container">
        {error && (
          <div className="error">
            {error}
            <button 
              onClick={() => setError('')} 
              style={{ float: 'right', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <div className="loading">Loading...</div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && !loading && (
          <section>
            <h2 className="section-title">Client Overview</h2>
            <div className="grid-3">
              {clients.map(client => (
                <div key={client._id} className="card">
                  <div className="row">
                    <div className="section-title" style={{ fontSize: '16px' }}>{client.name}</div>
                    <span className={`chip ${client.balance > 0 ? 'chip-amber' : 'chip-green'}`}>
                      ${client.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: '12px', marginBottom: '4px' }}>
                    WeChat: {client.wechatId || '—'}
                  </div>
                  <div className="muted" style={{ fontSize: '12px', marginBottom: '12px' }}>
                    {client.email || 'No email'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn primary" 
                      style={{ flex: 1 }}
                      onClick={() => handleViewStatement(client._id)}
                    >
                      View Statement
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => handleCreateInvoice(client._id)}
                    >
                      Create Invoice
                    </button>
                  </div>
                </div>
              ))}
              {clients.length === 0 && (
                <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                  <div className="muted">No clients found. Add your first client to get started.</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && !loading && (
          <section className="grid-2">
            <div className="card">
              <h3 className="section-title">Add New Client</h3>
              <form onSubmit={handleAddClient}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Company Name *</div>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., New Client Ltd"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>WeChat ID</div>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., new_client"
                      value={newClient.wechatId}
                      onChange={(e) => setNewClient({...newClient, wechatId: e.target.value})}
                    />
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Email</div>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="e.g., contact@client.com"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Phone</div>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="e.g., +1234567890"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <button type="submit" className="btn primary" style={{ width: '100%' }}>
                      Add Client
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="card">
              <h3 className="section-title">All Clients ({clients.length})</h3>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {clients.map(client => (
                  <div key={client._id} className="client-row">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{client.name}</div>
                      <div className="muted" style={{ fontSize: '12px' }}>
                        {client.wechatId && `WeChat: ${client.wechatId} • `}
                        {client.email || 'No contact info'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: client.balance > 0 ? '#92400e' : '#065f46',
                        marginBottom: '4px'
                      }}>
                        ${client.balance.toFixed(2)}
                      </div>
                      <button 
                        className="btn" 
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                        onClick={() => handleViewStatement(client._id)}
                      >
                        View Statement
                      </button>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    No clients yet. Add your first client above.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && !loading && (
          <section className="grid-2">
            <div className="card">
              <h3 className="section-title">Add New Transaction</h3>
              <form onSubmit={handleAddTransaction}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="muted" style={{ fontSize: '12px' }}>Client *</div>
                    <select
                      className="input-field"
                      value={newTransaction.client}
                      onChange={(e) => setNewTransaction({...newTransaction, client: e.target.value})}
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Type</div>
                    <select
                      className="input-field"
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    >
                      <option value="debit">Debit (Money Owed)</option>
                      <option value="credit">Credit (Payment Received)</option>
                    </select>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Amount *</div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="input-field"
                      placeholder="0.00"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Date *</div>
                    <input
                      type="date"
                      className="input-field"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                      required
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="muted" style={{ fontSize: '12px' }}>Description *</div>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., Cloud Ops Retainer – November 2023"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      required
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button type="submit" className="btn primary" style={{ width: '100%' }}>
                      Add Transaction
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="card">
              <h3 className="section-title">Recent Transactions</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Type</th>
                      <th className="right">Amount</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 20).map(transaction => (
                      <tr key={transaction._id}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{transaction.client?.name}</td>
                        <td>
                          <span className={`chip ${transaction.type === 'debit' ? 'chip-amber' : 'chip-green'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="right">
                          {transaction.type === 'credit' ? '($' : '$'}
                          {transaction.amount.toFixed(2)}
                          {transaction.type === 'credit' ? ')' : ''}
                        </td>
                        <td>{transaction.description}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                          No transactions yet. Add your first transaction.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Client Statement Tab */}
        {activeTab === 'statement' && clientStatement && !loading && (
          <section className="card">
            <div className="row">
              <h2 className="section-title">
                Statement for {clientStatement.client.name}
              </h2>
              <button className="btn" onClick={() => setActiveTab('clients')}>
                Back to Clients
              </button>
            </div>
            
            <div className="statement-summary">
              <div className="statement-card">
                <div className="muted">Current Balance</div>
                <div className={`statement-value ${clientStatement.client.balance > 0 ? 'positive' : 'negative'}`}>
                  ${clientStatement.client.balance.toFixed(2)}
                </div>
              </div>
              <div className="statement-card">
                <div className="muted">Total Transactions</div>
                <div className="statement-value">{clientStatement.summary.totalTransactions}</div>
              </div>
              <div className="statement-card">
                <div className="muted">Contact Info</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  {clientStatement.client.wechatId && (
                    <div>WeChat: {clientStatement.client.wechatId}</div>
                  )}
                  {clientStatement.client.email && (
                    <div>Email: {clientStatement.client.email}</div>
                  )}
                  {clientStatement.client.phone && (
                    <div>Phone: {clientStatement.client.phone}</div>
                  )}
                </div>
              </div>
            </div>

            <h3 className="section-title">Transaction History</h3>
            {clientStatement.transactions.length > 0 ? (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th className="right">Amount</th>
                      <th>Description</th>
                      <th>Billed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientStatement.transactions.map(transaction => (
                      <tr key={transaction._id}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`chip ${transaction.type === 'debit' ? 'chip-amber' : 'chip-green'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="right">
                          {transaction.type === 'credit' ? '($' : '$'}
                          {transaction.amount.toFixed(2)}
                          {transaction.type === 'credit' ? ')' : ''}
                        </td>
                        <td>{transaction.description}</td>
                        <td>
                          <span className={`chip ${transaction.billed ? 'chip-green' : 'chip-gray'}`}>
                            {transaction.billed ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                No transactions found for this client.
              </div>
            )}
          </section>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && !loading && (
          <section className="card">
            <h3 className="section-title">Invoice Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div>
                <div className="muted" style={{ fontSize: '12px' }}>Filter by client</div>
                <select className="input-field">
                  <option>All Clients</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="two-col">
                <div>
                  <div className="muted" style={{ fontSize: '12px' }}>From</div>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <div className="muted" style={{ fontSize: '12px' }}>To</div>
                  <input type="date" className="input-field" />
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                <button className="btn primary" onClick={handleExportExcel}>Export to Excel</button>
              </div>
            </div>

            {invoices.map(invoice => (
              <div key={invoice._id} className="card" style={{ padding: '16px', borderRadius: '14px', marginBottom: '16px' }}>
                <div className="invoice-header">
                  <div className="logo">FG</div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--accent)' }}>Fusion Global</div>
                    <div className="muted" style={{ fontSize: '12px' }}>Invoice • {invoice.invoiceNumber}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div className={`status ${invoice.status}`}>{invoice.status}</div>
                    <div className="muted" style={{ fontSize: '12px' }}>
                      Date: {new Date(invoice.date).toISOString().split('T')[0]}
                    </div>
                  </div>
                </div>
                <div className="two-col" style={{ fontSize: '14px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: '#374151', fontWeight: '500' }}>Bill To</div>
                    <div>{invoice.client?.name}</div>
                    <div className="muted">WeChat: {invoice.client?.wechatId || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div style={{ color: '#374151', fontWeight: '500' }}>From</div>
                    <div>Fusion Global</div>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr><th>Description</th><th className="right">Amount</th></tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td className="right">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr><td className="right" style={{ fontWeight: '600' }}>Total</td><td className="right" style={{ fontWeight: '600' }}>${invoice.total.toFixed(2)}</td></tr>
                  </tfoot>
                </table>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <div className="btn primary">Send to WeChat</div>
                  <div className="btn success" onClick={() => handleMarkPaid(invoice._id)}>Mark Paid</div>
                  <div className="btn">Delete</div>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                No invoices yet. Create invoices from the Dashboard or Client statements.
              </div>
            )}
          </section>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && !loading && (
          <section className="card">
            <h3 className="section-title">Recent Activity</h3>
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
              <p>Activity logging will show:</p>
              <ul>
                <li>Client additions and updates</li>
                <li>Transaction recordings</li>
                <li>Invoice generation and status changes</li>
                <li>WeChat notifications sent</li>
                <li>Payment confirmations</li>
              </ul>
              <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div className="muted" style={{ fontSize: '12px' }}>Sample Activity Entry</div>
                <div>[2023-11-06 11:30:45] Created invoice INV-12345 for Acme Trading Ltd</div>
                <div>[2023-11-06 11:31:20] Sent invoice to WeChat: @acme_trading</div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="container" style={{ paddingBottom: '40px' }}>
        <div className="muted" style={{ fontSize: '12px' }}>
          Fusion Global v1.0 • © 2024 Fusion Global. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;