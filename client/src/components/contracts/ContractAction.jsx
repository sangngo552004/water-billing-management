// src/components/contracts/ContractActions.jsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function ContractActions({
  suspendContractId,
  setSuspendContractId,
  handleSuspendContract,
  activateContractId,
  setActivateContractId,
  handleActivateContract,
  cancelContractId,
  setCancelContractId,
  handleCancelContract,
}) {
  return (
    <>
      {/* Suspend Confirmation */}
      <AlertDialog open={!!suspendContractId} onOpenChange={() => setSuspendContractId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận tạm dừng hợp đồng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn tạm dừng hợp đồng này không? Hợp đồng sẽ không còn hoạt động cho đến khi được kích hoạt lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => suspendContractId && handleSuspendContract(suspendContractId)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Xác nhận tạm dừng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Confirmation */}
      <AlertDialog open={!!activateContractId} onOpenChange={() => setActivateContractId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận kích hoạt hợp đồng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn kích hoạt lại hợp đồng này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => activateContractId && handleActivateContract(activateContractId)}
              className="bg-green-600 hover:bg-green-700"
            >
              Kích hoạt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancelContractId} onOpenChange={() => setCancelContractId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy hợp đồng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy hợp đồng này không? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelContractId && handleCancelContract(cancelContractId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}