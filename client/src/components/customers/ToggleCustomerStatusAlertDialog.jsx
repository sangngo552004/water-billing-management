import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function ToggleCustomerStatusAlertDialog({ customerId, customersData, isOpen, onClose, onConfirm }) {
  if (!isOpen || !customersData) return null

  const customer = customersData.find((c) => c.id === customerId);
  const isActive = customer?.isActive;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận thay đổi trạng thái</AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? "Bạn có chắc chắn muốn vô hiệu hóa tài khoản khách hàng này? Khách hàng sẽ không thể đăng nhập và sử dụng dịch vụ."
              : "Bạn có chắc chắn muốn kích hoạt lại tài khoản khách hàng này? Khách hàng sẽ có thể đăng nhập và sử dụng dịch vụ bình thường."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(customerId)}
            className={isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}