import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Package, User, CreditCard, CheckCircle, Wifi, Settings, History, Info, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:4000');

function App() {
  const [screen, setScreen] = useState('MAIN'); // MAIN, MEMBERSHIP, BENEFITS, PAYMENT_A, PAYMENT_B, DONE
  const [product, setProduct] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [store, setStore] = useState({ title: "HYUNDAI VPOS", name: "현대백화점 압구정점", location: "6F 나이키", staff: "한아름 (224456)" });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    socket.on('product-info', (info) => {
      setProduct(info);
      // Stay on MAIN screen, just update product state
    });

    socket.on('ble-connection-success', (data) => {
      setCustomer(data.user);
      setStore(data.store);
      // Removed: setPendingCustomers([]); // Don't clear here, let the server manage the list
      // Skip MEMBERSHIP screen, go directly to BENEFITS
      setScreen('BENEFITS');
    });

    socket.on('vpos-auto-select', (data) => {
      // Auto-select: skip to BENEFITS directly
      setCustomer(data.user);
      setStore(data.store);
      setScreen('BENEFITS');
    });

    socket.on('pending-customers-update', (customers) => {
      setPendingCustomers(customers);
    });

    socket.on('payment-status-update', (data) => {
      if (data.status === 'COMPLETE') {
        setScreen('DONE');
      }
    });

    return () => {
      socket.off('product-info');
      socket.off('ble-connection-success');
      socket.off('vpos-auto-select');
      socket.off('payment-status-update');
      socket.off('pending-customers-update');
    };
  }, []);

  const handleScanSimulation = () => {
    socket.emit('vpos-scan', 'ALPHAF03');
  };

  const handleSelectCustomer = (userId) => {
    socket.emit('vpos-select-customer', userId);
  };

  const handleAppPaymentSelection = () => {
    setScreen('PAYMENT_B');
    socket.emit('vpos-request-app-payment', {
      orderId: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      product,
      customer
    });
  };

  const handleOfflinePaymentSelection = () => {
    setScreen('PAYMENT_A');
  };

  const handleOfflinePaymentComplete = () => {
    const receipt = {
      orderId: "ORD-OFF-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      product,
      paymentMethod: '현대백화점 카드',
      amount: product.price * 0.9,
      points: Math.floor(product.price * 0.9 * 0.01),
      userId: customer.id // Add userId for server cleanup
    };
    socket.emit('vpos-offline-payment-complete', receipt);
    setScreen('DONE');
  };

  const reset = () => {
    setScreen('MAIN');
    setProduct(null);
    setCustomer(null);
  };

  const MainScreen = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content">
      {/* 상품 정보 영역 - 축소 */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '8px', flexShrink: 0 }}>
        <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
          <Package size={18} /> 상품 정보
        </h3>

        {!product ? (
          // 스캔 전 상태 - 스캔 후와 동일한 크기
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="badge badge-blue" style={{ fontSize: '10px', padding: '2px 8px' }}>대기중</span>
              <span style={{ color: 'rgba(0,0,0,0.60)', fontSize: '11px' }}>-</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ marginBottom: '2px', fontSize: '15px', color: 'rgba(0,0,0,0.38)' }}>상품 정보 없음</h2>
                <p style={{ color: 'rgba(0,0,0,0.60)', margin: 0, fontSize: '12px' }}>
                  바코드를 스캔하세요
                </p>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '500', color: 'rgba(0,0,0,0.38)' }}>
                -
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', minHeight: '36px', fontSize: '12px', marginTop: '6px' }} onClick={handleScanSimulation}>
              스캔 시뮬레이션
            </button>
          </div>
        ) : (
          // 스캔 후 상태 - 간소화
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="badge badge-blue" style={{ fontSize: '10px', padding: '2px 8px' }}>수신됨</span>
              <span style={{ color: 'rgba(0,0,0,0.60)', fontSize: '11px' }}>{product.style}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ marginBottom: '2px', fontSize: '15px' }}>{product.name}</h2>
                <p style={{ color: 'rgba(0,0,0,0.60)', margin: 0, fontSize: '12px' }}>
                  {product.size} / {product.color}
                </p>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '500', color: '#1976D2' }}>
                {product.price.toLocaleString()}원
              </div>
            </div>
            <button className="btn btn-outline" style={{ width: '100%', minHeight: '36px', fontSize: '12px', marginTop: '6px' }} onClick={reset}>취소</button>
          </div>
        )}
      </div>

      {/* 결제 대기 고객 영역 - RecyclerView 스타일 */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', flexShrink: 0 }}>
          <User size={18} /> 결제 대기 고객 ({pendingCustomers.length})
        </h3>

        {pendingCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', background: '#F5F5F5', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <User size={28} style={{ marginBottom: '8px', opacity: 0.38, color: 'rgba(0,0,0,0.38)', margin: '0 auto 8px' }} />
            <p style={{ marginBottom: '6px', fontSize: '13px' }}>고객 정보 대기 중...</p>
            <p style={{ color: 'rgba(0,0,0,0.60)', fontSize: '11px' }}>
              앱의 카드 탭을 선택해주세요
            </p>
          </div>
        ) : (
          // RecyclerView 스타일 스크롤 영역
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '4px'
          }}>
            {pendingCustomers.map(cust => (
              <motion.div
                key={cust.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectCustomer(cust.id)}
                className="glass-card"
                style={{
                  cursor: 'pointer',
                  border: '1px solid rgba(25, 118, 210, 0.2)',
                  transition: 'all 0.2s',
                  padding: '10px',
                  marginBottom: '0',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{cust.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.60)' }}>{cust.level} | {cust.id}</div>
                  </div>
                  <CheckCircle size={18} color="#1976D2" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* BLE 상태 - 축소 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4CAF50', fontSize: '11px', padding: '4px 8px', flexShrink: 0 }}>
        <Wifi size={14} /> BLE 활성화됨
      </div>
    </motion.div>
  );


  const MembershipScreen = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content">
      <div className="glass-card" style={{ border: '2px solid #4CAF50' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4CAF50', marginBottom: '16px' }}>
          <CheckCircle size={20} /> <span style={{ fontWeight: '500' }}>고객 정보 확인 완료</span>
        </div>
        <h3>{customer?.name} 고객님</h3>
        <p style={{ color: 'rgba(0,0,0,0.60)', fontSize: '14px' }}>{customer?.level} / {customer?.id}</p>
        <p style={{ marginTop: '8px', fontSize: '14px' }}>보유 포인트: {customer?.points.toLocaleString()}P</p>
      </div>
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <div className="loader" style={{ marginBottom: '16px' }}></div>
        <p style={{ fontSize: '14px' }}>혜택 조회 중...</p>
        <p style={{ color: 'rgba(0,0,0,0.60)', fontSize: '12px' }}>서버에서 최적 혜택을 계산하고 있습니다</p>
      </div>
    </motion.div>
  );

  const BenefitsScreen = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <button className="btn btn-outline" style={{ padding: '8px 16px', width: 'auto', minHeight: '48px', fontSize: '12px' }} onClick={() => setScreen('MAIN')}>← 이전</button>
        <h2 style={{ marginBottom: 0, fontSize: '16px' }}>혜택 안내</h2>
      </div>

      {/* 고객 정보 섹션 - 축소 */}
      <div className="glass-card" style={{ border: '1px solid #4CAF50', marginBottom: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{customer?.name} 고객님 <span style={{ color: '#4CAF50', fontSize: '11px' }}>✓</span></div>
            <div style={{ color: 'rgba(0,0,0,0.60)', fontSize: '11px' }}>{customer?.level} | {customer?.id}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.60)' }}>포인트</div>
            <div style={{ fontWeight: '500', fontSize: '14px', color: '#1976D2' }}>{customer?.points.toLocaleString()}P</div>
          </div>
        </div>
      </div>

      {/* 추천 혜택 1: 현대백화점 카드 - 축소 */}
      <div className="glass-card" style={{ background: 'rgba(25, 118, 210, 0.08)', border: '1px solid #1976D2', marginBottom: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 500, fontSize: '13px' }}>⭐ 추천 1: 현대백화점 카드</span>
          <span style={{ color: '#4CAF50', fontWeight: 500, fontSize: '13px' }}>10% 할인</span>
        </div>
        <div style={{ padding: '8px', background: '#F5F5F5', borderRadius: '6px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
            <span>상품 금액</span>
            <span>{product?.price.toLocaleString()}원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#FFC107', fontSize: '12px' }}>
            <span>VIP 할인</span>
            <span>-{(product?.price * 0.1).toLocaleString()}원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, fontSize: '16px' }}>
            <span>최종 결제액</span>
            <span>{(product?.price * 0.9).toLocaleString()}원</span>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', minHeight: '40px', fontSize: '13px' }} onClick={handleOfflinePaymentSelection}>
          카드 결제 진행
        </button>
      </div>

      {/* 추천 혜택 2: 앱 결제 - 축소 */}
      <div className="glass-card" style={{ marginBottom: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: 500, fontSize: '13px' }}>추천 2: 앱 결제 (카카오페이)</span>
          <span style={{ color: '#1976D2', fontWeight: 500, fontSize: '13px' }}>10% 적립</span>
        </div>
        <button className="btn btn-outline" style={{ width: '100%', minHeight: '40px', fontSize: '13px' }} onClick={handleAppPaymentSelection}>
          <Smartphone size={18} /> 앱 결제 요청
        </button>
      </div>
    </motion.div>
  );

  const PaymentAScreen = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', textAlign: 'left' }}>
        <button className="btn btn-outline" style={{ padding: '8px 16px', width: 'auto', minHeight: '48px' }} onClick={() => setScreen('BENEFITS')}>← 이전</button>
        <h2 style={{ marginBottom: 0 }}>카드 결제</h2>
      </div>
      <div className="glass-card">
        <div style={{ marginBottom: '24px' }}>
          <CreditCard size={56} style={{ marginBottom: '12px', opacity: 0.6, color: 'rgba(0,0,0,0.60)' }} />
          <p style={{ fontSize: '14px' }}>카드를 단말기에 넣어주세요</p>
        </div>
        <div style={{ textAlign: 'left', background: '#F5F5F5', padding: '16px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px' }}>결제 금액</span>
            <span style={{ fontWeight: 500, fontSize: '16px' }}>{(product?.price * 0.9).toLocaleString()}원</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.60)' }}>현대백화점 카드 전용 혜택 적용됨</p>
        </div>
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleOfflinePaymentComplete}>
        카드 삽입 완료
      </button>
    </motion.div>
  );

  const PaymentBScreen = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', textAlign: 'left' }}>
        <button className="btn btn-outline" style={{ padding: '8px 16px', width: 'auto', minHeight: '48px' }} onClick={() => setScreen('BENEFITS')}>← 이전</button>
        <h2 style={{ marginBottom: 0 }}>앱 결제 대기</h2>
      </div>
      <div className="glass-card">
        <Smartphone size={56} style={{ marginBottom: '12px', color: '#1976D2' }} />
        <p style={{ marginBottom: '16px', fontSize: '14px' }}>고객 앱으로 주문 정보가<br />전송되었습니다</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <div className="dot"></div>
          <div className="dot" style={{ animationDelay: '0.2s' }}></div>
          <div className="dot" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
      <p style={{ color: 'rgba(0,0,0,0.60)', fontSize: '14px' }}>고객이 앱에서 결제 중입니다...</p>
      <button className="btn btn-outline" style={{ marginTop: '16px' }} onClick={() => setScreen('BENEFITS')}>취소하고 다시 진행</button>
    </motion.div>
  );

  const DoneScreen = () => (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="content" style={{ textAlign: 'center' }}>
      <div className="glass-card" style={{ border: '2px solid #4CAF50', background: 'rgba(76, 175, 80, 0.08)' }}>
        <div style={{ background: '#4CAF50', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle size={32} />
        </div>
        <h2 style={{ color: '#4CAF50' }}>결제 완료</h2>
        <div style={{ textAlign: 'left', borderTop: '1px solid rgba(0,0,0,0.12)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span>상품</span>
            <span>{product?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span>결제 금액</span>
            <span style={{ fontWeight: 500 }}>{(screen === 'DONE' ? (product?.price * 0.9) : product?.price).toLocaleString()}원</span>
          </div>
          <p style={{ color: '#4CAF50', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>
            ✓ 전자 영수증이 고객 앱으로 전송되었습니다
          </p>
        </div>
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={reset}>다음 거래</button>
    </motion.div>
  );

  const SettingsModal = () => {
    const [tempTitle, setTempTitle] = useState(store.title);
    const [tempLocation, setTempLocation] = useState(store.location);
    const [tempStaff, setTempStaff] = useState(store.staff);

    const handleSave = () => {
      setStore({ ...store, title: tempTitle, location: tempLocation, staff: tempStaff });
      setShowSettings(false);
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: '320px',
            padding: '24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            boxShadow: '0 24px 38px rgba(0,0,0,0.14), 0 9px 46px rgba(0,0,0,0.12), 0 11px 15px rgba(0,0,0,0.20)'
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#1976D2', fontWeight: '400' }}>설정</h2>

          <div className="md-text-field">
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder=" "
            />
            <label>Title</label>
          </div>

          <div className="md-text-field">
            <input
              type="text"
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              placeholder=" "
            />
            <label>Shop</label>
          </div>

          <div className="md-text-field">
            <input
              type="text"
              value={tempStaff}
              onChange={(e) => setTempStaff(e.target.value)}
              placeholder=" "
            />
            <label>Salesperson</label>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => setShowSettings(false)}
            >
              취소
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSave}
            >
              저장
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="vpos-container">
      <header>
        <div className="logo">{store.title}</div>
        <div className="staff-info">
          <strong>{store.location}</strong>
          <span>{store.staff}</span>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {screen === 'MAIN' && <MainScreen key="main" />}
        {screen === 'MEMBERSHIP' && <MembershipScreen key="membership" />}
        {screen === 'BENEFITS' && <BenefitsScreen key="benefits" />}
        {screen === 'PAYMENT_A' && <PaymentAScreen key="pay_a" />}
        {screen === 'PAYMENT_B' && <PaymentBScreen key="pay_b" />}
        {screen === 'DONE' && <DoneScreen key="done" />}
      </AnimatePresence>

      <footer>
        {/* 왼쪽: 시스템 상태 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            boxShadow: '0 0 6px rgba(76, 175, 80, 0.6)'
          }}></div>
          <span style={{ color: '#4CAF50', fontWeight: '500' }}>Connected</span>
        </div>

        <div style={{ flex: 1 }}></div>

        {/* 오른쪽: 설정 */}
        <button
          className="btn btn-outline"
          style={{ padding: '12px', minHeight: '48px', minWidth: '48px' }}
          onClick={() => setShowSettings(true)}
        >
          <Settings size={20} />
        </button>
      </footer>

      {/* 설정 모달 */}
      {showSettings && <SettingsModal />}

      <style dangerouslySetInnerHTML={{
        __html: `
        .loader {
          border: 3px solid rgba(0,0,0,0.12);
          border-top: 3px solid #1976D2;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .dot {
          width: 8px;
          height: 8px;
          background: #1976D2;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}} />
    </div>
  );
}

export default App;
