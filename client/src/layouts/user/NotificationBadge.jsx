import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BellIcon } from "lucide-react";
import { useSelector } from 'react-redux'; // Import useSelector để lấy token
import { useLocation } from 'react-router-dom'; // Import useLocation để lấy contractId từ URL

export function NotificationBadge({ unreadCount }) { // Đã bỏ 'contractId' khỏi props
  // State để lưu trữ danh sách thông báo
  const [notifications, setNotifications] = useState([]);
  // State để theo dõi trạng thái tải dữ liệu: 'idle', 'loading', 'succeeded', 'failed'
  const [status, setStatus] = useState('idle');
  // State để theo dõi trang hiện tại trong pagination (bắt đầu từ 0 theo API của bạn)
  const [currentPage, setCurrentPage] = useState(0);
  // State để kiểm soát việc còn dữ liệu để tải nữa hay không (nút "Xem thêm")
  const [hasMore, setHasMore] = useState(true);

  // State để điều khiển việc mở/đóng dialog thông báo chính
  const [open, setOpen] = useState(false);
  // State để điều khiển việc mở/đóng dialog chi tiết thông báo
  const [detailOpen, setDetailOpen] = useState(false);
  // State để lưu thông báo đang được xem chi tiết
  const [selectedNotification, setSelectedNotification] = useState(null);
  // State để lưu trữ loại thông báo được chọn để lọc ('all', 'invoice', 'request')
  const [typeFilter, setTypeFilter] = useState("all"); // Khởi tạo với "all"

  // Lấy token từ Redux store. Giả định token được lưu tại state.auth.token.
  const token = useSelector(state => state.auth.token);
  console.log("NotificationBadge: Current Token:", token ? "Token loaded" : "No token found");

  // Lấy đối tượng location từ react-router-dom
  const location = useLocation();
  // Trích xuất contractId trực tiếp từ URL
  const contractId = location.pathname.split('/')[1];
  console.log("NotificationBadge: contractId from URL:", contractId); // Ghi log contractId từ URL để debug

  /**
   * Hàm bất đồng bộ để fetch danh sách thông báo từ API.
   * Sử dụng useCallback để memoize hàm này, chỉ tạo lại khi 'token' thay đổi.
   * @param {number} pageToLoad - Số trang cần tải (bắt đầu từ 0).
   * @param {string} filterType - Loại thông báo để lọc ('all', 'invoice', 'request').
   * @param {string} currentContractIdFromUrl - ID của hợp đồng hiện tại (được truyền vào từ contractId cục bộ).
   */
  const fetchNotifications = useCallback(async (pageToLoad, filterType, currentContractIdFromUrl) => {
    // Nếu không có contractId (từ URL) hoặc token, không thể fetch thông báo.
    // Đặt lại trạng thái và thông báo, và thoát.
    if (!currentContractIdFromUrl || !token) {
      console.warn("NotificationBadge: Cannot fetch notifications. Missing contractId or token.");
      setStatus('idle');
      setNotifications([]);
      setHasMore(false);
      return;
    }

    setStatus('loading'); // Đặt trạng thái đang tải
    try {
      // Chuyển 'all' thành chuỗi rỗng cho tham số 'type' trên API nếu cần
      const actualFilterType = filterType === "all" ? "" : filterType;
      // Xây dựng URL API với đường dẫn tương đối (không hardcode localhost)
      const url = `http://localhost:8080/api/owner/contracts/${currentContractIdFromUrl}/notifications?page=${pageToLoad}&type=${actualFilterType}`;
      console.log("NotificationBadge: Fetching URL:", url); // Ghi log URL để debug
      console.log("NotificationBadge: Fetch Headers:", { 'Authorization': `Bearer ${token}` }); // Ghi log headers để debug

      // Thực hiện fetch request, kèm theo token trong header Authorization
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Kiểm tra trạng thái phản hồi HTTP
      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      // Parse phản hồi JSON
      const data = await response.json();
      console.log("NotificationBadge: API Response Data:", data); // Ghi log dữ liệu phản hồi

      // Ánh xạ dữ liệu từ DTO sang định dạng phù hợp với UI
      // Chú ý: Dựa trên cấu trúc phản hồi `data.content`
      const mappedNotifications = data.content.map(dto => ({
        id: dto.notificationId,
        title: dto.title,
        message: dto.content,
        type: dto.notificationType.toLowerCase(), // Chuyển type về chữ thường để so sánh dễ hơn
        date: new Date(dto.createdAt).toLocaleDateString('vi-VN'), // Định dạng ngày tháng
        read: dto.isRead,
      }));

      // Cập nhật state notifications:
      // FIX: Nếu là trang đầu tiên (pageToLoad === 0), thay thế hoàn toàn danh sách.
      // Nếu không, thêm các thông báo mới vào cuối danh sách hiện có.
      setNotifications(prev => (pageToLoad === 0 ? mappedNotifications : [...prev, ...mappedNotifications]));
      // Cập nhật hasMore dựa trên số trang hiện tại và tổng số trang
      setHasMore(pageToLoad < data.totalPages - 1); // totalPages là tổng số trang (dựa trên 1), pageToLoad dựa trên 0
      setStatus('succeeded'); // Đặt trạng thái thành công
      setCurrentPage(pageToLoad); // Cập nhật trang hiện tại đã tải
    } catch (error) {
      console.error("Không thể lấy thông báo:", error);
      setStatus('failed'); // Đặt trạng thái thất bại
      setNotifications([]); // Xóa thông báo trên UI nếu có lỗi
      setHasMore(false); // Không còn dữ liệu để tải
    }
  }, [token]); // Hàm này phụ thuộc vào 'token', sẽ tạo lại khi token thay đổi

  /**
   * useEffect để điều khiển việc fetch thông báo khi dialog mở,
   * hoặc khi contractId, typeFilter, hoặc token thay đổi.
   */
  useEffect(() => {
    console.log("NotificationBadge useEffect: contractId from URL:", contractId, "open:", open, "token:", token ? "present" : "absent", "typeFilter:", typeFilter);

    // Chỉ fetch thông báo nếu dialog đang mở, có contractId và có token
    if (open && contractId && token) {
      // Khi contractId hoặc typeFilter thay đổi, hoặc dialog vừa mở,
      // chúng ta muốn reset về trang 0 và tải lại thông báo.
      setCurrentPage(0); // Đặt lại trang về 0
      setHasMore(true); // Đặt lại hasMore để cho phép tải thêm
      fetchNotifications(0, typeFilter, contractId); // Luôn fetch trang 0 khi điều kiện thỏa mãn
    } else if (!open) {
      // Reset tất cả các state liên quan đến thông báo khi dialog đóng
      setNotifications([]);
      setCurrentPage(0);
      setHasMore(true);
      setStatus('idle');
      setSelectedNotification(null);
      setDetailOpen(false);
    }
  }, [open, typeFilter, contractId, token, fetchNotifications]); // Dependencies cho useEffect

  /**
   * Xử lý khi người dùng click vào nút "Xem thêm" để tải thêm thông báo.
   */
  const handleLoadMore = () => {
    // Chỉ tải thêm nếu còn dữ liệu và không đang trong quá trình tải
    if (hasMore && status !== 'loading') {
      fetchNotifications(currentPage + 1, typeFilter, contractId); // Truyền contractId cục bộ
    }
  };

  /**
   * Xử lý khi người dùng click vào một thông báo cụ thể.
   * Mở dialog chi tiết và đánh dấu thông báo là đã đọc nếu nó chưa đọc.
   * @param {object} notification - Đối tượng thông báo được click.
   */
  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification); // Đặt thông báo được chọn để hiển thị chi tiết
    setDetailOpen(true); // Mở dialog chi tiết

    // Nếu thông báo chưa được đọc, gọi API để đánh dấu là đã đọc
    if (!notification.read) {
        try {
            // Kiểm tra token trước khi gọi API
            if (!token) {
              console.warn("NotificationBadge: Cannot mark as read. Missing token.");
              return;
            }

            // Gọi API PUT để đánh dấu thông báo là đã đọc
            const response = await fetch(`http://localhost:8080/api/owner/notifications/${notification.id}/mark-as-read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Gửi token trong header
                },
            });

            if (!response.ok) {
                throw new Error(`Không thể đánh dấu đã đọc: ${response.status}`);
            }

           window.dispatchEvent(new CustomEvent('notificationsUpdated'));
            setNotifications(prev =>
                prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
            );

        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
        }
    }
  };

  /**
   * Hàm trợ giúp để trả về Badge component dựa trên loại thông báo.
   * @param {string} type - Loại thông báo ('invoice', 'request').
   * @returns {JSX.Element | null} Badge component hoặc null.
   */
  const getTypeBadge = (type) => {
    switch (type) {
      case "invoice":
        return (
          <Badge variant="outline" className="text-blue-600">
            Hóa đơn
          </Badge>
        );
      case "request":
        return (
          <Badge variant="outline" className="text-green-600">
            Yêu cầu
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Nút chuông thông báo */}
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)}>
        <BellIcon className="h-5 w-5" />
        {/* Badge hiển thị số lượng thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Dialog hiển thị danh sách thông báo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Thông báo</span>
            </DialogTitle>
          </DialogHeader>

          {/* Phần lọc thông báo theo loại */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="invoice">Hóa đơn</SelectItem>
                <SelectItem value="request">Yêu cầu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Khu vực cuộn hiển thị danh sách thông báo */}
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              {/* Hiển thị trạng thái tải */}
              {status === 'loading' && <div className="py-6 text-center text-gray-500">Đang tải...</div>}
              {/* Hiển thị thông báo nếu tải thành công và có dữ liệu */}
              {status === 'succeeded' && notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
                      notification.read ? "bg-white" : "bg-blue-50" // Thay đổi màu nền nếu thông báo chưa đọc
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        {getTypeBadge(notification.type)}
                      </div>
                      <span className="text-xs text-gray-500">{notification.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notification.message}</p>

                  </div>
                ))
              ) : status === 'succeeded' && (
                <div className="py-6 text-center text-gray-500">Không có thông báo nào</div>
              )}
              {/* Hiển thị thông báo lỗi nếu tải thất bại */}
              {status === 'failed' && (
                <div className="py-6 text-center text-red-500">Lỗi khi tải thông báo</div>
              )}
            </div>
            {/* Nút "Xem thêm" để tải thêm thông báo */}
            {hasMore && status === 'succeeded' && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handleLoadMore} disabled={status === 'loading'}>
                  {status === 'loading' ? 'Đang tải...' : 'Xem thêm'}
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog hiển thị chi tiết thông báo */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{selectedNotification.title}</h3>
                {getTypeBadge(selectedNotification.type)}
              </div>

              <div className="text-sm text-gray-500">
                Ngày: {selectedNotification.date}
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm leading-relaxed">{selectedNotification.message}</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
