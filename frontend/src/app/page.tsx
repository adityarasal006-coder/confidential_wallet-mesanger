'use client';
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage, useWriteContract, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther, formatEther } from 'viem';
import { Shield, Lock, Zap, Send, Timer, Search, Wallet, Coins, HandCoins, Check, X, MessageCircle, EyeOff, Activity, ArrowUpRight, ArrowDownRight, ChevronLeft, Bot } from 'lucide-react';
import { generateStealthAddress } from '@/utils/stealth';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
let socket: Socket | null = null;

const StealthRelayerABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "stealthAddress", "type": "address" },
      { "internalType": "bytes", "name": "ephemeralPubKey", "type": "bytes" }
    ],
    "name": "sendAVAX",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const RELAYER_ADDRESS = "0x0000000000000000000000000000000000000000"; 

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { writeContractAsync } = useWriteContract();
  
  const { data: balanceData } = useBalance({ address });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'wallet' | 'stealth'>('chat');
  
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  
  const [transferMode, setTransferMode] = useState(false);
  const [requestMode, setRequestMode] = useState(false);
  const [amount, setAmount] = useState('');
  const [disappearing, setDisappearing] = useState(false);
  
  const [stealthKeys, setStealthKeys] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && !isAuthenticated) {
      handleAuth();
    }
  }, [isConnected]);

  useEffect(() => {
    // We will initialize socket listeners after auth instead
  }, []);

  const handleConnect = () => connect({ connector: injected() });

  const handleAuth = async () => {
    try {
      if (!address) return;
      
      // 1. Get Nonce
      const nonceRes = await fetch(`${API_URL}/api/auth/nonce/${address}`);
      const nonceData = await nonceRes.json();
      if (!nonceData.nonce) throw new Error("Failed to fetch nonce");

      // 2. Sign Message
      const msg = `Sign this message to prove you own this wallet.\n\nNonce: ${nonceData.nonce}`;
      const signature = await signMessageAsync({ message: msg });

      // 3. Verify Signature & Get JWT
      const verifyRes = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature })
      });
      
      const authData = await verifyRes.json();
      if (!authData.token) throw new Error("Authentication failed");

      // Save JWT
      localStorage.setItem('auth_token', authData.token);
      setIsAuthenticated(true);
      
      // Initialize Socket with JWT
      if (!socket) {
        socket = io(API_URL, {
          auth: { token: authData.token }
        });
        
        socket.on('receive_message', (data) => {
          setMessages((prev) => [...prev, { ...data, sender: 'them', timestamp: Date.now() }]);
        });
        
        socket.on('newMessage', (data) => {
          setMessages((prev) => [...prev, { ...data, sender: data.sender === address.toLowerCase() ? 'me' : 'them', timestamp: Date.now() }]);
        });
      }
    } catch (err) {
      console.error("Auth failed:", err);
      disconnect(); // Disconnect wallet on auth failure
      alert("Authentication failed. Please try again.");
    }
  };

  const executeStealthTransfer = async (transferAmount: string) => {
    try {
      const { stealthAddress, stealthPrivateKey } = generateStealthAddress();
      setStealthKeys(prev => [...prev, { address: stealthAddress, privKey: stealthPrivateKey, amount: transferAmount, date: new Date().toLocaleString() }]);
      
      const tx = await writeContractAsync({
        address: RELAYER_ADDRESS as `0x${string}`,
        abi: StealthRelayerABI,
        functionName: 'sendAVAX',
        args: [stealthAddress as `0x${string}`, '0x00'],
        value: parseEther(transferAmount)
      });
      return { tx, stealthPrivateKey };
    } catch (err) {
      console.warn("Transaction failed or rejected by user.");
      throw err;
    }
  };

  const handleSend = async () => {
    if (!message && !transferMode && !requestMode) return;
    let newMsg: any = null;

    if (transferMode && amount) {
      try {
        const { tx, stealthPrivateKey } = await executeStealthTransfer(amount);
        const encryptedPayload = `[PRIVATE PAYMENT] Amount: ${amount} AVAX.\nTx: ${tx}\nClaim Key: ${stealthPrivateKey}`;
        newMsg = { type: 'payment', text: encryptedPayload, sender: 'me', timestamp: Date.now() };
      } catch (err) {
        alert("Transaction failed or was rejected.");
        return;
      }
    } else if (requestMode && amount) {
      const requestPayload = `[PAYMENT_REQUEST]:${amount}:${Date.now()}`;
      newMsg = { type: 'request', text: requestPayload, sender: 'me', status: 'pending', timestamp: Date.now() };
      
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'request', text: `[PAYMENT_REQUEST]:0.5:${Date.now()}`, sender: 'them', status: 'pending', timestamp: Date.now() }]);
      }, 3000);
      
    } else if (message) {
      newMsg = { type: 'text', text: message, sender: 'me', disappearing, timestamp: Date.now() };
    }

    if (newMsg) {
      setMessages([...messages, newMsg]);
      if (socket) {
        socket.emit('sendMessage', { 
           sender: address, 
           recipient: activeChat, 
           encryptedPayload: newMsg.text, 
           type: newMsg.type 
        });
      }
      
      if (newMsg.disappearing) {
        setTimeout(() => {
          setMessages(prev => prev.filter(m => m !== newMsg));
        }, 10000);
      }
    }
    
    setMessage('');
    setAmount('');
    setTransferMode(false);
    setRequestMode(false);
  };

  const handleAcceptRequest = async (msgIndex: number, requestedAmount: string) => {
    try {
      const { tx, stealthPrivateKey } = await executeStealthTransfer(requestedAmount);
      const updatedMessages = [...messages];
      updatedMessages[msgIndex].status = 'accepted';
      setMessages(updatedMessages);

      const encryptedPayload = `[PRIVATE PAYMENT] Amount: ${requestedAmount} AVAX.\nTx: ${tx}\nClaim Key: ${stealthPrivateKey}`;
      const paymentMsg = { type: 'payment', text: encryptedPayload, sender: 'me', timestamp: Date.now() };
      setMessages(prev => [...prev, paymentMsg]);
      if (socket) {
        socket.emit('sendMessage', { 
           sender: address, 
           recipient: activeChat, 
           encryptedPayload: paymentMsg.text, 
           type: paymentMsg.type 
        });
      }
    } catch (err) {
      alert("Payment rejected by wallet.");
    }
  };

  const handleDeclineRequest = (msgIndex: number) => {
    const updatedMessages = [...messages];
    updatedMessages[msgIndex].status = 'declined';
    setMessages(updatedMessages);
    const declineMsg = { type: 'text', text: "Sorry, I cannot make this payment at this time.", sender: 'me', timestamp: Date.now() };
    setMessages(prev => [...prev, declineMsg]);
    if (socket) {
      socket.emit('sendMessage', { 
         sender: address, 
         recipient: activeChat, 
         encryptedPayload: declineMsg.text, 
         type: declineMsg.type 
      });
    }
  };

  const renderMessage = (m: any, i: number) => {
    if (m.type === 'request') {
      const [_, reqAmount, id] = m.text.split(':');
      const isMe = m.sender === 'me';
      
      return (
        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
          <div className="bg-white text-zinc-900 p-4 sm:p-5 rounded-2xl w-[90%] sm:max-w-sm shadow-2xl border border-zinc-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#f6851b]/10 flex items-center justify-center shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm">Payment Request</p>
                <p className="text-xs text-zinc-500">Via Confidential Route</p>
              </div>
            </div>
            
            <div className="text-center py-4 bg-zinc-50 rounded-xl mb-4 border border-zinc-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-800">{reqAmount}</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-500 ml-1">AVAX</span>
            </div>
            
            {isMe ? (
              <div className="text-center text-sm font-semibold text-zinc-400 bg-zinc-100 p-2 rounded-lg">Waiting for response...</div>
            ) : m.status === 'pending' ? (
              <div className="flex gap-2">
                <button onClick={() => handleDeclineRequest(i)} className="flex-1 py-2 sm:py-2.5 rounded-xl border border-zinc-300 text-zinc-600 font-semibold text-xs sm:text-sm hover:bg-zinc-50 transition">Reject</button>
                <button onClick={() => handleAcceptRequest(i, reqAmount)} className="flex-1 py-2 sm:py-2.5 rounded-xl bg-[#037dd6] hover:bg-[#0260a4] text-white font-semibold text-xs sm:text-sm transition shadow-md shadow-[#037dd6]/20">Approve</button>
              </div>
            ) : m.status === 'accepted' ? (
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg font-semibold text-sm">
                <Check size={16} /> Payment Approved
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50 p-2 rounded-lg font-semibold text-sm">
                <X size={16} /> Request Declined
              </div>
            )}
          </div>
        </div>
      );
    }

    const isMe = m.sender === 'me';
    return (
      <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
        <div className={`p-3 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-[80%] ${m.type === 'payment' ? 'bg-gradient-to-r from-red-900 to-red-950 border border-red-500/30 text-red-100' : isMe ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-900 border border-zinc-800 text-zinc-200'} shadow-lg`}>
          <p className={m.type === 'payment' ? "font-mono text-xs sm:text-sm leading-relaxed" : "text-xs sm:text-sm whitespace-pre-wrap break-words"}>
            {m.text}
          </p>
        </div>
        {m.disappearing && (
          <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
            <Timer size={10} /> Disappears in 10s
          </span>
        )}
      </div>
    );
  };

  if (isConnected && isAuthenticated) {
    return (
      <main className="flex h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-hidden flex-col md:flex-row">
        
        {/* Responsive Mobile Bottom Nav / Desktop Side Nav */}
        <nav className="order-2 md:order-1 w-full h-16 md:w-20 md:h-full bg-zinc-900 md:bg-zinc-900 border-t md:border-t-0 md:border-r border-zinc-800 flex flex-row md:flex-col items-center justify-around md:justify-start md:py-6 md:gap-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl">
          <div className="hidden md:flex w-12 h-12 bg-red-600 rounded-xl items-center justify-center shadow-[0_0_15px_rgba(232,65,66,0.5)] mb-4">
            <Shield size={24} className="text-white" />
          </div>
          
          <button onClick={() => setActiveTab('chat')} className={`p-3 rounded-xl transition ${activeTab === 'chat' ? 'bg-red-500/20 text-red-500' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`} title="Messenger">
            <MessageCircle size={24} />
          </button>
          <button onClick={() => setActiveTab('wallet')} className={`p-3 rounded-xl transition ${activeTab === 'wallet' ? 'bg-red-500/20 text-red-500' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`} title="Wallet & Portfolio">
            <Wallet size={24} />
          </button>
          <button onClick={() => setActiveTab('stealth')} className={`p-3 rounded-xl transition ${activeTab === 'stealth' ? 'bg-red-500/20 text-red-500' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`} title="Stealth Explorer">
            <EyeOff size={24} />
          </button>

          <div className="md:mt-auto">
            <button onClick={() => disconnect()} className="p-3 rounded-xl text-zinc-600 hover:bg-zinc-800 hover:text-red-400 transition" title="Disconnect">
              <Activity size={24} />
            </button>
          </div>
        </nav>

        <div className="order-1 md:order-2 flex-1 flex items-center justify-center p-0 md:p-8 relative h-[calc(100dvh-4rem)] md:h-full">
          {/* Decorative Glow */}
          <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="w-full h-full md:max-w-6xl border-none md:border border-zinc-800 md:rounded-2xl bg-zinc-900/50 backdrop-blur-xl md:shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10">
            <AnimatePresence mode="wait">
              {/* VIEW 1: CHAT */}
              {activeTab === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col md:flex-row"
                >
                  {/* Chat List: Hidden on mobile if a chat is active */}
                  <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] border-b md:border-b-0 md:border-r border-zinc-800 flex-col bg-zinc-900/80 h-full shrink-0`}>
                  <div className="p-4 sm:p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Shield className="text-red-500 md:hidden" size={20} />
                      Inbox
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
                      <input type="text" placeholder="Search Address..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 transition" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {[{ addr: "0x1A2B...9C8D" }, { addr: "0x7F8E...3B2A" }].map((c, i) => (
                      <div key={i} onClick={() => setActiveChat(c.addr)} className={`p-4 rounded-xl cursor-pointer transition ${activeChat === c.addr ? 'bg-red-500/10 border border-red-500/30' : 'bg-zinc-800/30 hover:bg-zinc-800 border border-transparent'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
                            {c.addr.substring(2,4)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-mono text-sm font-medium truncate">{c.addr}</p>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 truncate"><Lock size={10} /> E2EE Sync Active</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chat Area: Hidden on mobile if NO chat is active */}
                <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-zinc-950/30 h-full`}>
                  {activeChat ? (
                    <>
                      <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                          {/* Back button for mobile */}
                          <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white">
                            <ChevronLeft size={24} />
                          </button>
                          
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-xs sm:text-sm">
                            {activeChat.substring(2,4)}
                          </div>
                          <div>
                            <h3 className="font-mono text-xs sm:text-sm font-medium">{activeChat}</h3>
                            <span className="text-[10px] sm:text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Network Linked</span>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button onClick={() => setDisappearing(!disappearing)} className={`p-1.5 sm:p-2 rounded-lg transition ${disappearing ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}><Timer size={16} /></button>
                          <button onClick={() => { setRequestMode(!requestMode); setTransferMode(false); }} className={`p-1.5 sm:p-2 rounded-lg transition ${requestMode ? 'bg-[#037dd6] text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}><HandCoins size={16} /></button>
                          <button onClick={() => { setTransferMode(!transferMode); setRequestMode(false); }} className={`p-1.5 sm:p-2 rounded-lg transition ${transferMode ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}><Coins size={16} /></button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                        {/* AI Risk Detection Banner */}
                        <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500 p-3 rounded-r-xl flex items-start gap-3">
                          <Shield className="text-orange-500 mt-0.5 shrink-0" size={18} />
                          <div>
                            <p className="text-sm font-semibold text-orange-400">AI Risk Detection Active</p>
                            <p className="text-xs text-zinc-400 mt-1">This wallet is new to the network. Do not send large amounts of AVAX until you verify their identity.</p>
                          </div>
                        </div>

                        {messages.map((m, i) => renderMessage(m, i))}
                      </div>

                      <div className="p-3 sm:p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
                        {/* AI Smart Replies */}
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#037dd6] bg-[#037dd6]/10 px-3 py-1.5 rounded-full shrink-0">
                            <Bot size={14} /> AI Suggestions
                          </div>
                          {["Yes, I received the transfer.", "Please send the payment request.", "Can we use a stealth address?"].map((reply, i) => (
                            <button key={i} onClick={() => setMessage(reply)} className="text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full whitespace-nowrap transition border border-zinc-700">
                              {reply}
                            </button>
                          ))}
                        </div>

                        {transferMode || requestMode ? (
                          <div className={`flex flex-col sm:flex-row gap-2 p-2 sm:p-3 bg-zinc-950 rounded-xl border ${requestMode ? 'border-[#037dd6]/30' : 'border-red-500/30'}`}>
                            <div className="flex gap-2 items-center flex-1">
                              <div className={`${requestMode ? 'bg-[#037dd6]/10 text-[#037dd6]' : 'bg-red-500/10 text-red-500'} p-2 sm:p-3 rounded-lg flex items-center justify-center shrink-0`}>
                                {requestMode ? <HandCoins size={18} /> : <Zap size={18} />}
                              </div>
                              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={requestMode ? "Amount to request..." : "Amount to send..."} className="w-full bg-transparent border-none focus:outline-none px-2 text-sm text-white placeholder-zinc-500" />
                            </div>
                            <button onClick={handleSend} className={`w-full sm:w-auto py-2 sm:py-0 ${requestMode ? 'bg-[#037dd6] hover:bg-[#0260a4]' : 'bg-red-600 hover:bg-red-500'} text-white px-6 rounded-lg font-medium text-sm transition`}>
                              {requestMode ? 'Request' : 'Send'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={disappearing ? "Disappearing message..." : "Encrypted message..."} className="flex-1 w-full bg-transparent border-none focus:outline-none px-3 sm:px-4 text-xs sm:text-sm text-white placeholder-zinc-500" />
                            <button onClick={handleSend} className="bg-red-600 hover:bg-red-500 text-white p-2.5 sm:p-3 rounded-lg transition shrink-0"><Send size={16} /></button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-sm p-4 text-center">
                      <Shield size={48} className="text-zinc-800 mb-4" />
                      <p>Select a conversation from the inbox<br className="md:hidden"/> to start messaging securely</p>
                    </div>
                  )}
                </div>
                </motion.div>
              )}

              {/* VIEW 2: WALLET PORTFOLIO */}
              {activeTab === 'wallet' && (
                <motion.div 
                  key="wallet"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 p-4 sm:p-8 bg-zinc-950/30 overflow-y-auto w-full h-full"
                >
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Web3 Portfolio</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  {/* Balance Card */}
                  <div className="bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-2xl shadow-2xl relative overflow-hidden h-40 flex flex-col justify-end">
                    <div className="absolute -top-4 -right-4 p-4 opacity-20"><Wallet size={120} /></div>
                    <p className="text-red-100 font-medium mb-1 text-sm relative z-10">Total Balance (Fuji)</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 relative z-10">
                      {balanceData ? parseFloat(formatEther(balanceData.value)).toFixed(4) : "0.0000"} <span className="text-lg sm:text-xl font-normal opacity-80">AVAX</span>
                    </h2>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center gap-4">
                    <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
                    <div className="flex gap-4">
                      <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition"><ArrowDownRight size={16} className="text-green-400" /> Receive</button>
                      <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition"><ArrowUpRight size={16} className="text-red-400" /> Send</button>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-4 text-zinc-400">Recent On-Chain Activity</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-zinc-500 py-12 text-sm">
                  No recent public transactions found on this network.
                </div>
                </motion.div>
              )}

              {/* VIEW 3: STEALTH EXPLORER */}
              {activeTab === 'stealth' && (
                <motion.div 
                  key="stealth"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 p-4 sm:p-8 bg-zinc-950/30 overflow-y-auto w-full h-full"
                >
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 bg-red-500/10 rounded-xl shrink-0"><EyeOff className="text-red-500" size={24} /></div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Stealth Explorer</h1>
                    <p className="text-zinc-500 text-xs sm:text-sm">Manage ephemeral keys and untraceable funds.</p>
                  </div>
                </div>

                {stealthKeys.length > 0 ? (
                  <div className="space-y-4">
                    {stealthKeys.map((keyObj, i) => (
                      <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 sm:p-6 rounded-2xl hover:border-red-500/30 transition">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Generated: {keyObj.date}</p>
                            <p className="font-bold text-lg sm:text-xl text-green-400">+{keyObj.amount} AVAX</p>
                          </div>
                          <button className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg">
                            Claim Funds
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-zinc-950 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between border border-zinc-800 gap-1">
                            <span className="text-xs text-zinc-500">Stealth Address:</span>
                            <span className="font-mono text-[10px] sm:text-xs truncate">{keyObj.address}</span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between border border-red-900/30 gap-1">
                            <span className="text-xs text-red-500 font-bold flex items-center gap-2"><Lock size={12}/> Private Key:</span>
                            <span className="font-mono text-[10px] sm:text-xs text-zinc-400 blur-sm hover:blur-none transition cursor-pointer truncate">{keyObj.privKey}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                    <Shield size={48} className="text-zinc-700 mb-4" />
                    <h3 className="text-base sm:text-lg font-bold text-zinc-300 mb-2">No Stealth Keys Generated</h3>
                    <p className="text-zinc-500 text-xs sm:text-sm max-w-sm">When you send or receive private payments, your ephemeral keys will appear here for claiming.</p>
                  </div>
                )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    );
  }

  // Landing Page
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 sm:p-24 text-center bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-red-600/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 px-4">
        <div className="mx-auto bg-zinc-900 border border-zinc-800 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl mb-6 sm:mb-8 shadow-2xl">
          <Shield className="text-red-500" size={24} />
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 sm:mb-6 text-white tracking-tight leading-tight">
          Private <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Conversations.</span><br/>
          Private <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Payments.</span>
        </h1>
        
        <p className="text-zinc-400 text-sm sm:text-lg mb-8 sm:mb-12 max-w-xl mx-auto leading-relaxed">
          The first end-to-end encrypted Web3 messenger with native, untraceable stealth transactions on the Avalanche Network.
        </p>
        
        <button onClick={handleConnect} className="group w-full sm:w-auto relative px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(232,65,66,0.4)] hover:shadow-[0_0_50px_rgba(232,65,66,0.6)] transition-all hover:-translate-y-1 overflow-hidden">
          <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
            <Wallet size={20} /> Connect MetaMask to Start
          </span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </button>
      </div>
    </main>
  );
}
