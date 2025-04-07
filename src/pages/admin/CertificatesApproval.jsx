import { Verified, Pending } from "@mui/icons-material";
import { Box, Chip, Button, Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fireApi } from "../../utils/useFire";

const CertificatesApproval = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fireApi("/admin/certifications/pending", "GET");

      const formattedData = res?.users?.flatMap(
        (user) =>
          user.certifications?.map((cert) => ({
            id: `${user._id}-${cert._id}`,
            userId: user._id,
            certificationId: cert._id,
            name: user.name || "N/A",
            email: user.email || "N/A",
            certificationTitle: cert.title || "N/A",
            institute: cert.institute || "N/A",
            duration: `${new Date(cert.startDate).getFullYear()} - ${new Date(
              cert.endDate
            ).getFullYear()}`,
            description: cert.description || "",
            status: cert.isVerified,
          })) || []
      );

      setRows(formattedData);
    } catch (error) {
      toast.error(error.message || "Failed to fetch certifications");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, certificationId) => {
    try {
      const res = await fireApi(
        `/admin/certifications/approve/${userId}/${certificationId}`,
        "PUT"
      );
      toast.success(res.message || "Certification verified successfully");
      getUsers();
    } catch (error) {
      toast.error(error.message || "Failed to verify certification");
    }
  };

  const handleReject = async (certificationId) => {
    try {
      const res = await fireApi(
        `/admin/certifications/reject/${certificationId}`,
        "DELETE"
      );
      toast.success(res.message || "Certification rejected");
      getUsers();
    } catch (error) {
      toast.error(error.message || "Failed to reject certification");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "name",
      headerName: "User Name",
      width: 180,
    },
    {
      field: "email",
      headerName: "Email",
      width: 220,
    },
    {
      field: "certificationTitle",
      headerName: "Certification",
      width: 200,
    },
    {
      field: "institute",
      headerName: "Institute",
      width: 200,
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Verified" : "Pending"}
          color={params.value ? "success" : "warning"}
          icon={
            params.value ? (
              <Verified fontSize="small" />
            ) : (
              <Pending fontSize="small" />
            )
          }
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() =>
              handleVerify(params.row.userId, params.row.certificationId)
            }
            disabled={params.row.status}
            sx={{ minWidth: 80, fontSize: "0.75rem", py: 0.5 }}
          >
            Verify
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleReject(params.row.certificationId)}
            sx={{ minWidth: 80, fontSize: "0.75rem", py: 0.5 }}
          >
            Reject
          </Button>
        </Box>
      ),
    }
  ];

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Paper elevation={0} sx={{ px: 3, mb: 2 }}>
        <h1 className="text-2xl font-semibold">Pending Certifications</h1>
        <p className="text-gray-600">Review and approve user certifications</p>
      </Paper>

      <Paper
  elevation={0}
  sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}
>
  {rows.length === 0 && !loading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" color="textSecondary">
        No pending certificates available
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={getUsers}
        sx={{ mt: 2 }}
      >
        Refresh
      </Button>
    </Box>
  ) : (
    <Box sx={{ width: "100%", flex: 1 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection={false}
        disableRowSelectionOnClick
      />
    </Box>
  )}
</Paper>

    </Box>
  );
};

export default CertificatesApproval;