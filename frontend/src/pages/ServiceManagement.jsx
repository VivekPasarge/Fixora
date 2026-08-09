import { useEffect, useState } from "react";
import api from "../api/axios";
import "./ServiceManagement.css";

const emptyForm = {
  name: "",
  description: "",
  category: "Home Repair",
  price: "",
  image: "",
  duration: "30-60 min",
  arrivalTime: "Within 45 mins",
  includedServices: [""],
  whyChoose: [
    {
      title: "",
      description: "",
    },
  ],
};

const ServiceManagement = () => {
  /* =========================================================
     STATE
     ========================================================= */

  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [status, setStatus] = useState("All");

  const [showAddForm, setShowAddForm] = useState(false);

  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState(emptyForm);


  /* =========================================================
     FETCH SERVICES
     ========================================================= */

  const fetchServices = async () => {
    try {
      setLoading(true);

      const response = await api.get("/services");

      setServices(response.data.services || []);
    } catch (error) {
      console.error(
        "Fetch Services Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load services"
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    fetchServices();
  }, []);


  /* =========================================================
     DELETE SERVICE
     ========================================================= */

  const deleteService = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await api.delete(
        `/services/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Service deleted successfully"
      );

      fetchServices();
    } catch (error) {
      console.error(
        "Delete Service Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete service"
      );
    }
  };


  /* =========================================================
     TOGGLE SERVICE STATUS
     ========================================================= */

  const toggleServiceStatus = async (id) => {
    try {
      const token =
        localStorage.getItem("token");

      await api.patch(
        `/services/${id}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchServices();
    } catch (error) {
      console.error(
        "Toggle Service Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update service status"
      );
    }
  };


  /* =========================================================
     INPUT CHANGE
     ========================================================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =========================================================
     INCLUDED SERVICE CHANGE
     ========================================================= */

  const handleIncludedServiceChange = (
    index,
    value
  ) => {
    setFormData((prev) => {
      const updated = [
        ...prev.includedServices,
      ];

      updated[index] = value;

      return {
        ...prev,
        includedServices: updated,
      };
    });
  };


  /* =========================================================
     ADD INCLUDED SERVICE
     ========================================================= */

  const addIncludedService = () => {
    setFormData((prev) => ({
      ...prev,
      includedServices: [
        ...prev.includedServices,
        "",
      ],
    }));
  };


  /* =========================================================
     REMOVE INCLUDED SERVICE
     ========================================================= */

  const removeIncludedService = (index) => {
    setFormData((prev) => {

      const updated =
        prev.includedServices.filter(
          (_, i) => i !== index
        );

      return {
        ...prev,
        includedServices:
          updated.length > 0
            ? updated
            : [""],
      };
    });
  };


  /* =========================================================
     WHY CHOOSE CHANGE
     ========================================================= */

  const handleWhyChooseChange = (
    index,
    field,
    value
  ) => {
    setFormData((prev) => {

      const updated =
        [...prev.whyChoose];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        whyChoose: updated,
      };
    });
  };


  /* =========================================================
     ADD WHY CHOOSE
     ========================================================= */

  const addWhyChoose = () => {
    setFormData((prev) => ({
      ...prev,
      whyChoose: [
        ...prev.whyChoose,
        {
          title: "",
          description: "",
        },
      ],
    }));
  };


  /* =========================================================
     REMOVE WHY CHOOSE
     ========================================================= */

  const removeWhyChoose = (index) => {
    setFormData((prev) => {

      const updated =
        prev.whyChoose.filter(
          (_, i) => i !== index
        );

      return {
        ...prev,
        whyChoose:
          updated.length > 0
            ? updated
            : [
                {
                  title: "",
                  description: "",
                },
              ],
      };
    });
  };


  /* =========================================================
     PREPARE FORM DATA
     ========================================================= */

  const prepareServiceData = () => {
    return {
      name: formData.name.trim(),

      description:
        formData.description.trim(),

      category: formData.category,

      price: Number(formData.price),

      image: formData.image.trim(),

      duration:
        formData.duration.trim(),

      arrivalTime:
        formData.arrivalTime.trim(),

      includedServices:
        formData.includedServices
          .map((item) => item.trim())
          .filter((item) => item !== ""),

      whyChoose:
        formData.whyChoose
          .map((item) => ({
            title: item.title.trim(),
            description:
              item.description.trim(),
          }))
          .filter(
            (item) =>
              item.title !== "" ||
              item.description !== ""
          ),
    };
  };


  /* =========================================================
     ADD SERVICE
     ========================================================= */

  const handleAddService = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("token");

      const serviceData =
        prepareServiceData();

      const response = await api.post(
        "/services",
        serviceData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "Service created successfully"
      );

      setShowAddForm(false);

      setEditingService(null);

      setFormData({
        ...emptyForm,
        includedServices: [""],
        whyChoose: [
          {
            title: "",
            description: "",
          },
        ],
      });

      fetchServices();
    } catch (error) {
      console.error(
        "Add Service Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create service"
      );
    }
  };


  /* =========================================================
     OPEN EDIT FORM
     ========================================================= */

  const openEditForm = (service) => {
    setEditingService(service);

    setFormData({
      name: service.name || "",

      description:
        service.description || "",

      category:
        service.category ||
        "Home Repair",

      price:
        service.price ?? "",

      image:
        service.image || "",

      duration:
        service.duration ||
        "30-60 min",

      arrivalTime:
        service.arrivalTime ||
        "Within 45 mins",

      includedServices:
        service.includedServices?.length
          ? service.includedServices
          : [""],

      whyChoose:
        service.whyChoose?.length
          ? service.whyChoose.map(
              (item) => ({
                title:
                  item.title || "",
                description:
                  item.description || "",
              })
            )
          : [
              {
                title: "",
                description: "",
              },
            ],
    });
  };


  /* =========================================================
     EDIT SERVICE
     ========================================================= */

  const handleEditService = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("token");

      const serviceData =
        prepareServiceData();

      const response = await api.put(
        `/services/${editingService._id}`,
        serviceData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      alert(
        response.data.message ||
          "Service updated successfully"
      );

      setEditingService(null);

      setShowAddForm(false);

      setFormData({
        ...emptyForm,
        includedServices: [""],
        whyChoose: [
          {
            title: "",
            description: "",
          },
        ],
      });

      fetchServices();
    } catch (error) {
      console.error(
        "Edit Service Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update service"
      );
    }
  };


  /* =========================================================
     CLOSE FORM
     ========================================================= */

  const closeForm = () => {
    setShowAddForm(false);

    setEditingService(null);

    setFormData({
      ...emptyForm,
      includedServices: [""],
      whyChoose: [
        {
          title: "",
          description: "",
        },
      ],
    });
  };


  /* =========================================================
     FILTER SERVICES
     ========================================================= */

  const filteredServices =
    services.filter((service) => {

      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        service.name
          ?.toLowerCase()
          .includes(searchText) ||
        service.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        service.category === category;

      const matchesStatus =
        status === "All" ||
        (
          status === "Active"
            ? service.isAvailable === true
            : service.isAvailable === false
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="service-management-page">

        <div className="service-loading">
          Loading services...
        </div>

      </div>
    );
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="service-management-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="service-management-header">

        <div>

          <span className="service-eyebrow">
            ADMIN PANEL
          </span>

          <h1>
            Service Management
          </h1>

          <p>
            Manage all services offered
            by Fixora.
          </p>

        </div>


        <button
          className="add-service-btn"
          onClick={() => {

            setEditingService(null);

            setFormData({
              ...emptyForm,
              includedServices: [""],
              whyChoose: [
                {
                  title: "",
                  description: "",
                },
              ],
            });

            setShowAddForm(true);
          }}
        >
          + Add Service
        </button>

      </div>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {(showAddForm ||
        editingService) && (

        <div className="service-form-overlay">

          <div className="service-form-modal">

            {/* FORM HEADER */}

            <div className="service-form-header">

              <div>

                <span>
                  {editingService
                    ? "EDIT SERVICE"
                    : "NEW SERVICE"}
                </span>

                <h2>
                  {editingService
                    ? "Edit Service"
                    : "Add Service"}
                </h2>

                <p>
                  {editingService
                    ? "Update the service information."
                    : "Add a new service to Fixora."}
                </p>

              </div>


              <button
                type="button"
                className="close-form-btn"
                onClick={closeForm}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                editingService
                  ? handleEditService
                  : handleAddService
              }
              className="service-form"
            >

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <div className="form-section-title">
                Basic Information
              </div>


              {/* SERVICE NAME */}

              <div className="form-group">

                <label>
                  Service Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleInputChange
                  }
                  placeholder="e.g. Electrician"
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Describe the service..."
                  rows="4"
                  required
                />

              </div>


              {/* CATEGORY + PRICE */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="Home Repair">
                      Home Repair
                    </option>

                    <option value="Cleaning">
                      Cleaning
                    </option>

                    <option value="Electrical">
                      Electrical
                    </option>

                    <option value="Plumbing">
                      Plumbing
                    </option>

                    <option value="Painting">
                      Painting
                    </option>

                    <option value="Appliance">
                      Appliance
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={
                      formData.price
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="299"
                    min="0"
                    required
                  />

                </div>

              </div>


              {/* DURATION + ARRIVAL */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Duration
                  </label>

                  <input
                    type="text"
                    name="duration"
                    value={
                      formData.duration
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="30-60 min"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Arrival Time
                  </label>

                  <input
                    type="text"
                    name="arrivalTime"
                    value={
                      formData.arrivalTime
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Within 45 mins"
                  />

                </div>

              </div>


              {/* IMAGE */}

              <div className="form-group">

                <label>
                  Image URL
                </label>

                <input
                  type="text"
                  name="image"
                  value={
                    formData.image
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="https://..."
                />

              </div>


              {/* =================================================
                  INCLUDED SERVICES
              ================================================= */}

              <div className="form-section">

                <div className="form-section-heading">

                  <div>

                    <div className="form-section-title">
                      Included Services
                    </div>

                    <p>
                      Add what is included
                      in this service.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="add-small-btn"
                    onClick={
                      addIncludedService
                    }
                  >
                    + Add
                  </button>

                </div>


                <div className="dynamic-list">

                  {formData.includedServices.map(
                    (item, index) => (

                      <div
                        className="dynamic-item"
                        key={index}
                      >

                        <span className="dynamic-number">
                          {index + 1}
                        </span>

                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            handleIncludedServiceChange(
                              index,
                              e.target.value
                            )
                          }
                          placeholder={
                            "e.g. Professional inspection"
                          }
                        />

                        {formData
                          .includedServices
                          .length > 1 && (

                          <button
                            type="button"
                            className="remove-small-btn"
                            onClick={() =>
                              removeIncludedService(
                                index
                              )
                            }
                          >
                            ×
                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* =================================================
                  WHY CHOOSE FIXORA
              ================================================= */}

              <div className="form-section">

                <div className="form-section-heading">

                  <div>

                    <div className="form-section-title">
                      Why Choose Fixora
                    </div>

                    <p>
                      Add reasons customers
                      should choose this service.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="add-small-btn"
                    onClick={
                      addWhyChoose
                    }
                  >
                    + Add Point
                  </button>

                </div>


                <div className="why-choose-list">

                  {formData.whyChoose.map(
                    (item, index) => (

                      <div
                        className="why-choose-item"
                        key={index}
                      >

                        <div className="why-choose-top">

                          <span>
                            Point {index + 1}
                          </span>

                          {formData
                            .whyChoose
                            .length > 1 && (

                            <button
                              type="button"
                              className="remove-small-btn"
                              onClick={() =>
                                removeWhyChoose(
                                  index
                                )
                              }
                            >
                              Remove
                            </button>

                          )}

                        </div>


                        <div className="form-group">

                          <label>
                            Title
                          </label>

                          <input
                            type="text"
                            value={
                              item.title
                            }
                            onChange={(e) =>
                              handleWhyChooseChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder={
                              "e.g. Verified Professionals"
                            }
                          />

                        </div>


                        <div className="form-group">

                          <label>
                            Description
                          </label>

                          <textarea
                            value={
                              item.description
                            }
                            onChange={(e) =>
                              handleWhyChooseChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder={
                              "Explain why customers should choose Fixora..."
                            }
                            rows="3"
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* =================================================
                  FORM ACTIONS
              ================================================= */}

              <div className="service-form-actions">

                <button
                  type="button"
                  className="cancel-form-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-service-btn"
                >
                  {editingService
                    ? "Update Service"
                    : "Add Service"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="service-summary">

        <div className="service-summary-card">

          <span>
            Total Services
          </span>

          <strong>
            {services.length}
          </strong>

        </div>


        <div className="service-summary-card">

          <span>
            Active
          </span>

          <strong>
            {
              services.filter(
                (service) =>
                  service.isAvailable
              ).length
            }
          </strong>

        </div>


        <div className="service-summary-card">

          <span>
            Inactive
          </span>

          <strong>
            {
              services.filter(
                (service) =>
                  !service.isAvailable
              ).length
            }
          </strong>

        </div>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="service-filters">

        <div className="service-search">

          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >

          <option value="All">
            All Categories
          </option>

          <option value="Home Repair">
            Home Repair
          </option>

          <option value="Cleaning">
            Cleaning
          </option>

          <option value="Electrical">
            Electrical
          </option>

          <option value="Plumbing">
            Plumbing
          </option>

          <option value="Painting">
            Painting
          </option>

          <option value="Appliance">
            Appliance
          </option>

        </select>


        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >

          <option value="All">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>

        </select>

      </div>


      {/* =====================================================
          SERVICES TABLE
      ===================================================== */}

      <div className="service-table-card">

        {filteredServices.length === 0 ? (

          <div className="no-services">

            <h3>
              No Services Found
            </h3>

            <p>
              Try changing your search
              or filters.
            </p>

          </div>

        ) : (

          <div className="service-table-wrapper">

            <table className="service-table">

              <thead>

                <tr>

                  <th>
                    Service
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Rating
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredServices.map(
                  (service) => (

                    <tr
                      key={service._id}
                    >

                      <td>

                        <div className="service-name-cell">

                          <div className="service-image">

                            {service.image ? (

                              <img
                                src={
                                  service.image
                                }
                                alt={
                                  service.name
                                }
                              />

                            ) : (

                              <span>
                                {service.name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </span>

                            )}

                          </div>


                          <div>

                            <strong>
                              {service.name}
                            </strong>

                            <p>
                              {
                                service.description
                              }
                            </p>

                          </div>

                        </div>

                      </td>


                      <td>

                        <span className="category-badge">
                          {
                            service.category
                          }
                        </span>

                      </td>


                      <td>

                        <strong>
                          ₹{service.price}
                        </strong>

                      </td>


                      <td>

                        <span className="rating-value">
                          ★{" "}
                          {
                            service.rating ||
                            "N/A"
                          }
                        </span>

                      </td>


                      <td>

                        <button
                          className={
                            service.isAvailable
                              ? "status-badge active"
                              : "status-badge inactive"
                          }
                          onClick={() =>
                            toggleServiceStatus(
                              service._id
                            )
                          }
                        >
                          {service.isAvailable
                            ? "Active"
                            : "Inactive"}
                        </button>

                      </td>


                      <td>

                        <div className="service-actions">

                          <button
                            className="edit-service-btn"
                            onClick={() =>
                              openEditForm(
                                service
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            className="delete-service-btn"
                            onClick={() =>
                              deleteService(
                                service._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default ServiceManagement;