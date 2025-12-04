import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PaymentSettings = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ account_number: '', bank_code: '', bank_name: '' });
  const [verifiedAccount, setVerifiedAccount] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchBanks();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me');
      setBankAccounts(response.data.data.bank_accounts || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch user data');
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await api.get('/users/banks');
      setBanks(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch banks');
    }
  };

  const verifyAccount = async () => {
    if (!newAccount.account_number || !selectedBank) return;
    
    setLoading(true);
    try {
      const response = await api.post('/users/verify-account', {
        account_number: newAccount.account_number,
        bank_code: selectedBank.code
      });
      setVerifiedAccount(response.data.data);
      setNewAccount(prev => ({ 
        ...prev, 
        account_name: response.data.data.account_name,
        bank_code: selectedBank.code,
        bank_name: selectedBank.name
      }));
    } catch (error) {
      alert('Failed to verify account');
    }
    setLoading(false);
  };

  const addBankAccount = async () => {
    setLoading(true);
    try {
      await api.post('/users/me/bank-accounts', {
        bank_name: newAccount.bank_name,
        account_number: newAccount.account_number,
        account_name: newAccount.account_name,
        bank_code: newAccount.bank_code,
        is_default: bankAccounts.length === 0
      });
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      
      // Refresh the bank accounts list
      await fetchUserData();
      
      alert('Bank account added successfully!');
    } catch (error) {
      alert('Failed to add bank account');
    }
    setLoading(false);
  };

  const removeBankAccount = async (accountId) => {
    const password = prompt('Enter your password to confirm removal:');
    if (!password) return;

    try {
      await api.post(`/users/me/bank-accounts/${accountId}/remove`, { password });
      fetchUserData();
    } catch (error) {
      alert('Failed to remove account');
    }
  };

  const setDefaultAccount = async (accountId) => {
    try {
      await api.patch('/users/me/bank-accounts/default', { account_id: accountId });
      fetchUserData();
    } catch (error) {
      alert('Failed to set default account');
    }
  };

  const resetForm = () => {
    setNewAccount({ account_number: '', bank_code: '', bank_name: '' });
    setVerifiedAccount(null);
    setSelectedBank(null);
  };

  return (
    <div className="payment-settings">
      <h2>Payment Settings</h2>
      
      <button 
        onClick={() => setShowAddModal(true)}
        className="btn btn-primary mb-4"
      >
        Add Bank Account
      </button>

      <div className="bank-accounts">
        {bankAccounts.length === 0 ? (
          <p>No bank accounts added</p>
        ) : (
          bankAccounts.map(account => (
            <div key={account._id} className="bank-account-card">
              <div className="bank-info">
                <h4>{account.bank_name}</h4>
                <p>{account.account_name}</p>
                <p>{account.account_number}</p>
                {account.is_default && <span className="default-badge">Default</span>}
              </div>
              
              <div className="account-actions">
                {!account.is_default && (
                  <button 
                    onClick={() => setDefaultAccount(account._id)}
                    className="btn btn-secondary"
                  >
                    Set Default
                  </button>
                )}
                <button 
                  onClick={() => removeBankAccount(account._id)}
                  className="btn btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Bank Account</h3>
            
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                value={newAccount.account_number}
                onChange={(e) => setNewAccount(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Enter account number"
              />
            </div>

            <div className="form-group">
              <label>Select Bank</label>
              <select 
                value={selectedBank?.code || ''}
                onChange={(e) => {
                  const bank = banks.find(b => b.code === e.target.value);
                  setSelectedBank(bank);
                }}
              >
                <option value="">Choose a bank</option>
                {banks.map(bank => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {newAccount.account_number && selectedBank && !verifiedAccount && (
              <button 
                onClick={verifyAccount}
                disabled={loading}
                className="btn btn-info"
              >
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
            )}

            {verifiedAccount && (
              <div className="verification-result">
                <h4>Account Verified</h4>
                <p>Name: {verifiedAccount.account_name}</p>
                <p>Number: {verifiedAccount.account_number}</p>
              </div>
            )}

            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              
              {verifiedAccount && (
                <button 
                  onClick={addBankAccount}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Adding...' : 'Add Account'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .payment-settings {
          padding: 20px;
        }
        
        .bank-account-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .default-badge {
          background: #28a745;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .account-actions {
          display: flex;
          gap: 8px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: bold;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .verification-result {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          padding: 12px;
          border-radius: 4px;
          margin: 16px 0;
        }
        
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn-primary { background: #007bff; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-info { background: #17a2b8; color: white; }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PaymentSettings;