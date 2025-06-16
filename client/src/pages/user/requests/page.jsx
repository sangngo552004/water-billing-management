import { useState, useEffect, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Select is not used, can be removed if not needed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added AlertTitle
import { CheckCircle2, XCircleIcon, InfoIcon } from "lucide-react"; // Added XCircleIcon, InfoIcon

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("info");

  // State for fetching owner info
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loadingOwnerInfo, setLoadingOwnerInfo] = useState(true);
  const [errorOwnerInfo, setErrorOwnerInfo] = useState(null);

  // States for 'Chỉnh sửa thông tin' form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // State for 'Dừng hoạt động' form
  const [stopReason, setStopReason] = useState("");

  // States for submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState("idle"); // 'idle', 'pending', 'success', 'error'
  const [submissionMessage, setSubmissionMessage] = useState("");

  const location = useLocation();
  const contractId = location.pathname.split('/')[1];
  const token = useSelector(state => state.auth.token);

  /**
   * Fetches owner information from the API.
   * Memoized using useCallback.
   */
  const fetchOwnerInfo = useCallback(async () => {
    if (!contractId || !token) {
      setErrorOwnerInfo("Missing Contract ID or Authentication Token.");
      setLoadingOwnerInfo(false);
      return;
    }

    setLoadingOwnerInfo(true);
    setErrorOwnerInfo(null);

    try {
      const response = await fetch(`http://localhost:8080/api/owner/contracts/${contractId}/owner-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      setOwnerInfo(data);
      // Initialize form fields with fetched data
      setNewName(data.ownerName || "");
      setNewPhone(data.ownerPhone || "");
      setNewEmail(data.ownerEmail || "");

    } catch (err) {
      console.error("Error fetching owner info:", err);
      setErrorOwnerInfo("Không thể tải thông tin chủ sở hữu. Vui lòng thử lại.");
    } finally {
      setLoadingOwnerInfo(false);
    }
  }, [contractId, token]); // Dependencies for useCallback

  // Effect to fetch owner info when component mounts or dependencies change
  useEffect(() => {
    fetchOwnerInfo();
  }, [fetchOwnerInfo]);

  /**
   * Handles form submission for both tabs.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus("pending");
    setSubmissionMessage("");

    try {
      let response;
      let payload = { contractId: Number(contractId) }; // contractId common for both

      if (activeTab === "info") {
        // Validation for change info request
        if (!newName.trim()) {
            throw new Error("Họ và tên mới không được để trống.");
        }
        if (!newPhone.trim() || !/^[0-9]{10,15}$/.test(newPhone)) {
            throw new Error("Số điện thoại mới không hợp lệ (10-15 chữ số).");
        }
        if (newEmail.trim() && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/.test(newEmail)) {
            throw new Error("Email mới không hợp lệ.");
        }


        payload = {
            ...payload,
            newFullName: newName,
            newEmail: newEmail,
            newPhoneNumber: newPhone,
        };
        response = await fetch(`http://localhost:8080/api/owner/requests/change-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else if (activeTab === "stop") {
        // Validation for stop service request
        if (!stopReason.trim()) {
            throw new Error("Lý do dừng hoạt động không được để trống.");
        }
        payload = {
            ...payload,
            reason: stopReason,
        };
        response = await fetch(`http://localhost:8080/api/owner/requests/stop-service`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        throw new Error("Tab không hợp lệ.");
      }

      if (!response.ok) {
        // Try to parse error message from backend if available
        const errorData = await response.json();
        throw new Error(errorData.message || `Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      setSubmissionStatus("success");
      setSubmissionMessage("Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ xử lý trong thời gian sớm nhất.");

      // Reset form fields after successful submission
      if (activeTab === "info") {
        setNewName("");
        setNewPhone("");
        setNewEmail("");
        // Re-fetch owner info to show updated current values
        fetchOwnerInfo();
      } else if (activeTab === "stop") {
        setStopReason("");
      }

    } catch (err) {
      console.error("Submission error:", err);
      setSubmissionStatus("error");
      setSubmissionMessage(err.message || "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
      // Automatically hide success/error message after a few seconds
      setTimeout(() => {
        setSubmissionStatus("idle");
        setSubmissionMessage("");
      }, 5000);
    }
  };

  // Render loading state for owner info
  if (loadingOwnerInfo) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <p className="text-gray-500">Đang tải thông tin chủ sở hữu...</p>
      </div>
    );
  }

  // Render error state for owner info
  if (errorOwnerInfo) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-red-600">
        <p>{errorOwnerInfo}</p>
      </div>
    );
  }

  // Render not found state for owner info
  if (!ownerInfo) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <p className="text-gray-500">Không tìm thấy thông tin chủ sở hữu cho hợp đồng này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gửi yêu cầu</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Chỉnh sửa thông tin</TabsTrigger>
          <TabsTrigger value="stop">Dừng hoạt động</TabsTrigger>
        </TabsList>

        {/* Submission Feedback Alert */}
        {submissionStatus !== "idle" && (
          <Alert className={`mt-6 ${
            submissionStatus === "success" ? "bg-green-50 border-green-200" :
            submissionStatus === "error" ? "bg-red-50 border-red-200" :
            "bg-blue-50 border-blue-200" // For pending state
          }`}>
            {submissionStatus === "success" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {submissionStatus === "error" && <XCircleIcon className="h-5 w-5 text-red-600" />}
            {submissionStatus === "pending" && <InfoIcon className="h-5 w-5 text-blue-600 animate-pulse" />}
            <AlertTitle className="ml-2">
                {submissionStatus === "success" ? "Thành công!" :
                 submissionStatus === "error" ? "Lỗi!" :
                 "Đang xử lý..."}
            </AlertTitle>
            <AlertDescription className="ml-2">
              {submissionMessage}
            </AlertDescription>
          </Alert>
        )}

        <>
          <TabsContent value="info" className="mt-6">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Yêu cầu chỉnh sửa thông tin</CardTitle>
                  <CardDescription>Gửi yêu cầu chỉnh sửa thông tin cá nhân của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div></div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Họ và tên hiện tại</div>
                        <div className="font-medium text-gray-800">{ownerInfo.ownerName || 'N/A'}</div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newName">Họ và tên mới</Label>
                        <Input id="newName" placeholder="Nhập họ và tên mới" value={newName} onChange={(e) => setNewName(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Số điện thoại hiện tại</div>
                        <div className="font-medium text-gray-800">{ownerInfo.ownerPhone || 'N/A'}</div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPhone">Số điện thoại mới</Label>
                        <Input id="newPhone" placeholder="Nhập số điện thoại mới" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Email hiện tại</div>
                        <div className="font-medium text-gray-800">{ownerInfo.ownerEmail || 'N/A'}</div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newEmail">Email mới</Label>
                        <Input id="newEmail" type="email" placeholder="Nhập email mới" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting && activeTab === "info" ? "Đang gửi..." : "Gửi yêu cầu"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="stop" className="mt-6">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Yêu cầu dừng hoạt động</CardTitle>
                  <CardDescription>Gửi yêu cầu dừng cung cấp dịch vụ nước</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div></div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stopReason">Lý do dừng hoạt động</Label>
                      <Textarea id="stopReason" placeholder="Nhập lý do dừng hoạt động" className="min-h-[120px]" value={stopReason} onChange={(e) => setStopReason(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting && activeTab === "stop" ? "Đang gửi..." : "Gửi yêu cầu"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </>
      </Tabs>
    </div>
  );
}
