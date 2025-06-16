import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotificationBadge } from "./NotificationBadge";
import { fetchContracts } from '../../redux/contract/contractService';
import { DropletIcon } from "lucide-react"


export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy contracts từ store
  const contractsFromStore = useSelector(state => state.contracts.contracts);
  const contracts = Array.isArray(contractsFromStore) ? contractsFromStore : [];
  // Lấy trạng thái fetch để biết khi nào dữ liệu đã sẵn sàng
  const contractsStatus = useSelector(state => state.contracts.status);
  // Lấy token từ Redux store để gửi kèm trong các API request
  const token = useSelector(state => state.auth.token); 

  console.log("Header: Render - Contracts from store (current render):", contracts);
  console.log("Header: Render - contractsStatus:", contractsStatus);

  const [unreadCount, setUnreadCount] = useState(0);
  const [currentContractIdForApi, setCurrentContractIdForApi] = useState(null);

  const initialUrlCorrected = useRef(false);

  // Effect 1: Fetch contracts khi component mount
  useEffect(() => {
    console.log("Header: useEffect (Fetch Contracts) - Dispatching fetchContracts...");
    dispatch(fetchContracts());
  }, [dispatch]);

  // Effect 2: Đồng bộ hóa currentContractIdForApi với URL và xử lý điều hướng mặc định ban đầu
  // Logic này sẽ xác định `contractId` từ URL, nếu không hợp lệ hoặc không có,
  // sẽ chọn `contractId` của hợp đồng đầu tiên và cập nhật URL cũng như state `currentContractIdForApi`.
  useEffect(() => {
    console.log("--- Header Main Sync useEffect Triggered ---");
    console.log("  location.pathname:", location.pathname);
    console.log("  contracts.length:", contracts.length);
    console.log("  contractsStatus:", contractsStatus);
    console.log("  currentContractIdForApi (before logic):", currentContractIdForApi);
    console.log("  initialUrlCorrected.current:", initialUrlCorrected.current);

    const contractIdFromUrl = location.pathname.split('/')[1];
    let desiredContractId = null;

    if (contractsStatus === 'succeeded' && contracts.length > 0) {
        console.log("  Contracts loaded. Attempting to find contract in URL.");
        console.log("  Contracts data to check:", contracts); 
        console.log("  Contract ID from URL (string) being searched for:", contractIdFromUrl);

        // FIX: Chuyển đổi contractIdFromUrl sang kiểu số để khớp với contractId trong mảng
        // Sử dụng Number() để đảm bảo so sánh đúng kiểu dữ liệu
        const contractInUrl = contracts.find(c => c.contractId === Number(contractIdFromUrl)); 
        
        if (contractInUrl) {
            desiredContractId = String(contractInUrl.contractId); // Chuyển lại thành chuỗi để lưu vào state nếu cần
            console.log("  Contract found in URL. Desired ID:", desiredContractId);
        } else {
            desiredContractId = String(contracts[0].contractId); 
            console.log("  Contract in URL NOT found or invalid. Defaulting to first contract:", desiredContractId);

            const remainingPath = location.pathname.split('/').slice(2).join('/');
            const targetPath = `/${desiredContractId}/${remainingPath}`;

            if (!initialUrlCorrected.current && location.pathname !== targetPath) {
                console.log("  Performing initial URL correction to:", targetPath);
                navigate(targetPath, { replace: true });
                initialUrlCorrected.current = true;
            } else if (location.pathname === targetPath) {
                console.log("  URL already matches desired path. No initial redirect needed.");
            } else {
                console.log("  Initial URL correction already performed or not needed.");
            }
        }
    } else {
        console.log("  Contracts not yet loaded or empty. currentContractIdForApi remains null.");
    }

    if (desiredContractId !== null && desiredContractId !== currentContractIdForApi) {
        console.log("  Updating currentContractIdForApi from", currentContractIdForApi, "to", desiredContractId);
        setCurrentContractIdForApi(desiredContractId);
    } else {
        console.log("  currentContractIdForApi already set or desired is null (no update):", desiredContractId);
    }

  }, [location.pathname, contracts, contractsStatus, navigate]);


  // Effect 3: Fetch thông báo chưa đọc khi currentContractIdForApi HOẶC token thay đổi
  useEffect(() => {
    const fetchUnreadNotifications = async (contractIdToFetch) => {
      console.log("Header: useEffect (Fetch Unread Notifications) - Fetching for contractId:", contractIdToFetch);
      if (!contractIdToFetch || !token) {
        console.warn("Header: Cannot fetch unread notifications. Missing contractId or token.");
        setUnreadCount(0);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/owner/contracts/${contractIdToFetch}/count-unread-notifications`, { // Đã sửa thành URL tương đối
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        const data = await response.json();
        console.log("Header: API response for unread notifications:", data); // Ghi log dữ liệu API
        setUnreadCount(data.count || 0);
        console.log("Header: Unread notifications count:", data.count);
      } catch (error) {
        console.error("Không thể lấy thông báo chưa đọc:", error);
        setUnreadCount(0);
      }
    };

    if (currentContractIdForApi) {
      fetchUnreadNotifications(currentContractIdForApi);
    } else {
      setUnreadCount(0);
    }

  }, [currentContractIdForApi, token]);

  useEffect(() => {
    const handleNotificationsUpdate = () => {
      console.log("Header: Received 'notificationsUpdated' event. Refreshing unread count.");
      if (currentContractIdForApi && token) {
        fetch(`http://localhost:8080/api/owner/contracts/${currentContractIdForApi}/count-unread-notifications`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(res => res.json()).then(data => setUnreadCount(data.count || 0))
          .catch(err => console.error("Error refreshing unread count:", err));
      }
    };
    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);
    return () => window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
  }, [currentContractIdForApi, token]);

  const handleContractChange = (newContractId) => {
    console.log("handleContractChange: User selected newContractId:", newContractId);
    const currentPathSegments = location.pathname.split('/');
    const remainingPath = currentPathSegments.slice(2).join('/');
    const newPath = `/${newContractId}/${remainingPath}`;
    console.log("handleContractChange: Navigating to:", newPath);
    navigate(newPath);
  };

  // currentContractIdForApi sẽ luôn là chuỗi, nên so sánh string với string sẽ hoạt động.
  const selectedContract = contracts.find(c => String(c.contractId) === currentContractIdForApi); 
  console.log("Header: Render - Selected Contract for UI:", selectedContract?.customerCode);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
          <DropletIcon className="h-6 w-6 text-blue-600" />
          <Link to={`/${currentContractIdForApi}`} className="text-xl font-bold text-blue-600">
            Quản Lý Tiền Nước
          </Link>
        </div>
      <div className="flex items-center gap-4">
        <Select
          value={currentContractIdForApi || ""}
          onValueChange={handleContractChange}
        >
          <SelectTrigger className="w-[180px] sm:w-[200px]">
            <SelectValue>
              {selectedContract ? (
                selectedContract.customerCode
              ) : (
                "Chọn hợp đồng"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {contracts.map(contract => (
              <SelectItem key={contract.contractId} value={String(contract.contractId)}> {/* Chuyển contractId thành chuỗi cho SelectItem value */}
                {contract.customerCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NotificationBadge unreadCount={unreadCount} />
      </div>
    </header>
  );
}
