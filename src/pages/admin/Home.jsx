import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import toast from "react-hot-toast";
import { fireApi } from "../../utils/useFire";
import { useEffect, useState } from "react";
import { PictureAsPdf } from "@mui/icons-material";
import Button from "@mui/material/Button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Home = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await fireApi("/admin/all-users", "GET");

      const formatedData = res?.data?.map((user, index) => ({
        id: user._id || index + 1,
        name: user.name || "N/A",
        username: user.username || "N/A",
        age: user.age || "N/A",
        email: user.email || "N/A",
        role: user.role || "N/A",
        about: user.about || "N/A",
      }));

      setRows(formatedData);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "username",
      headerName: "Username",
      width: 150,
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "email",
      headerName: "Email",
      type: "email",
      width: 200,
    },
    {
      field: "role",
      headerName: "Role",
      type: "string",
      width: 80,
    },
    {
      field: "about",
      headerName: "About User",
      type: "string",
      width: 150,
    },
    {
      field: "action",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ mt: 1 }}
            startIcon={<PictureAsPdf />}
            onClick={() => generateUserReport(params.row)}
          >
            Report
          </Button>
          {/* <DeleteForeverOutlined className="cursor-pointer" onClick={() => deleteUser(params.row.id)} /> */}
        </div>
      ),
    },
  ];
  const calculateEngagementRate = (data) => {
    const totalInteractions =
      (data.totalComments || 0) +
      (data.totalLikes || 0) +
      (data.totalShares || 0);
    const engagementRate = data.totalPosts
      ? (totalInteractions / data.totalPosts) * 100
      : 0;
    return engagementRate.toFixed(2);
  };

  const getPerformanceIndicator = (userValue, average) => {
    if (userValue > average * 1.2) return "Excellent";
    if (userValue > average) return "Good";
    if (userValue > average * 0.8) return "Average";
    return "Needs Improvement";
  };

  const generateUserReport = async (user) => {
    try {
      setLoading(true);
      const reportData = await fireApi(`/admin/user-report/${user.id}`, "GET");

      // Create PDF with landscape orientation
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      // Add header with logo and title
      doc.setFontSize(22);
      doc.setTextColor(40, 53, 147);
      doc.setFont("helvetica", "bold");
      doc.text("USER PERFORMANCE REPORT", 105, 20, { align: "left" });

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);

      // Profile picture positioning
      const imageX = 20;
      const imageY = 30;
      const imageWidth = 30;
      const imageHeight = 30;

      // Text positioning - starts at same Y as image but right side
      const textX = 60; // Right of the image
      const initialTextY = imageY; // Starts at same level as image
      const lineHeight = 7; // Space between lines

      // Add image
      if (reportData.user.profilePicture) {
        try {
          doc.addImage(
            reportData.user.profilePicture,
            "JPEG",
            imageX,
            imageY,
            imageWidth,
            imageHeight
          );
        } catch (error) {
          console.error("Error adding profile image:", error);
          doc.text(
            "Profile Image Unavailable",
            imageX,
            imageY + imageHeight / 2
          );
        }
      }

      // Add user details - each line increments Y position by lineHeight
      doc.text(`Name: ${reportData.user.name || "N/A"}`, textX, initialTextY);
      doc.text(
        `Username: ${reportData.user.username || "N/A"}`,
        textX,
        initialTextY + lineHeight
      );
      doc.text(
        `Email: ${reportData.user.email || "N/A"}`,
        textX,
        initialTextY + lineHeight * 2
      );
      doc.text(
        `Role: ${reportData.user.role || "N/A"}`,
        textX,
        initialTextY + lineHeight * 3
      );
      doc.text(
        `Headline: ${reportData.user.headline || "N/A"}`,
        textX,
        initialTextY + lineHeight * 4
      );
      doc.text(
        `Location: ${reportData.user.location || "N/A"}`,
        textX,
        initialTextY + lineHeight * 5
      );

      // Add report date below all other details
      const reportDateY = initialTextY + lineHeight * 6;
      doc.text(
        `Report Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        textX,
        reportDateY
      );

      // Add divider line below all user info
      const dividerY = reportDateY + lineHeight;
      doc.setDrawColor(200, 200, 200);
      doc.line(20, dividerY, 277, dividerY);

      // Main content area starts below the divider
      const contentStartY = dividerY + 10;

      // User stats table
      const stats = [
        ["Metric", "Count", "Performance"],
        [
          "Total Posts",
          reportData.data.totalPosts || 0,
          getPerformanceIndicator(reportData.data.totalPosts, 125),
        ],
        [
          "Total Comments",
          reportData.data.totalComments || 0,
          getPerformanceIndicator(reportData.data.totalComments, 320),
        ],
        [
          "Total Shares",
          reportData.data.totalShares || 0,
          getPerformanceIndicator(reportData.data.totalShares, 85),
        ],
        [
          "Total Likes",
          reportData.data.totalLikes || 0,
          getPerformanceIndicator(reportData.data.totalLikes, 540),
        ],
        [
          "Total Events",
          reportData.data.totalEvents || 0,
          getPerformanceIndicator(reportData.data.totalEvents, 100),
        ],
        [
          "Engagement Rate",
          `${calculateEngagementRate(reportData.data)}%`,
          getPerformanceIndicator(calculateEngagementRate(reportData.data), 12),
        ],
      ];

      autoTable(doc, {
        startY: contentStartY,
        head: [stats[0]],
        body: stats.slice(1),
        theme: "grid",
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          halign: "center",
        },
        columnStyles: {
          0: { fontStyle: "bold" },
          2: {
            fontStyle: "bold",
            cellWidth: "auto",
            didDrawCell: (data) => {
              if (data.cell.raw === "Excellent") {
                doc.setTextColor(46, 125, 50);
              } else if (data.cell.raw === "Good") {
                doc.setTextColor(30, 136, 229);
              } else if (data.cell.raw === "Average") {
                doc.setTextColor(255, 152, 0);
              } else {
                doc.setTextColor(198, 40, 40);
              }
            },
          },
        },
      });

      // Experience Section
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Work Experience", 20, doc.lastAutoTable.finalY + 15);

      if (reportData.user.experience?.length > 0) {
        const expData = reportData.user.experience.map((exp) => [
          exp.company || "N/A",
          exp.title || "N/A",
          new Date(exp.startDate).toLocaleDateString() +
            " - " +
            (exp.endDate
              ? new Date(exp.endDate).toLocaleDateString()
              : "Present"),
          exp.description || "",
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [["Company", "Position", "Duration", "Description"]],
          body: expData,
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          columnStyles: {
            3: { cellWidth: "auto" },
          },
        });
      } else {
        doc.setFontSize(12);
        doc.text(
          "No work experience listed",
          20,
          doc.lastAutoTable.finalY + 20
        );
      }

      // Education Section
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("Education", 20, doc.lastAutoTable.finalY + 15);

      if (reportData.user.education?.length > 0) {
        const eduData = reportData.user.education.map((edu) => [
          edu.school || "N/A",
          edu.fieldOfStudy || "N/A",
          `${edu.startYear} - ${edu.endYear}`,
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [["Institution", "Field of Study", "Years"]],
          body: eduData,
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
        });
      } else {
        doc.setFontSize(12);
        doc.text("No education listed", 20, doc.lastAutoTable.finalY + 20);
      }

      const pageHeight = doc.internal.pageSize.height;
      const footerY = Math.min(doc.lastAutoTable.finalY + 20, pageHeight - 10);
      doc.setFontSize(10);
      doc.setTextColor(100); // Gray color for footer
      doc.text("© 2024 UniLink - All Rights Reserved", 105, footerY, {
        align: "center",
      });
      // Save the PDF
      doc.save(`user-report-${reportData.user.username}.pdf`);

      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Box sx={{ height: "auto", width: "100%" }}>
      <h1 className="text-2xl font-semibold mb-4 px-4">Users List</h1>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
      />

  
    </Box>
  );
};

export default Home;
