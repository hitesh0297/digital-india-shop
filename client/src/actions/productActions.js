// productActions.js (all-in-one)

// ----------------- CONSTANTS -----------------
export const PRODUCT_LIST_REQUEST = "PRODUCT_LIST_REQUEST";
export const PRODUCT_LIST_SUCCESS = "PRODUCT_LIST_SUCCESS";
export const PRODUCT_LIST_FAIL = "PRODUCT_LIST_FAIL";

export const PRODUCT_DETAILS_REQUEST = "PRODUCT_DETAILS_REQUEST";
export const PRODUCT_DETAILS_SUCCESS = "PRODUCT_DETAILS_SUCCESS";
export const PRODUCT_DETAILS_FAIL = "PRODUCT_DETAILS_FAIL";

export const PRODUCT_DELETE_REQUEST = "PRODUCT_DELETE_REQUEST";
export const PRODUCT_DELETE_SUCCESS = "PRODUCT_DELETE_SUCCESS";
export const PRODUCT_DELETE_FAIL = "PRODUCT_DELETE_FAIL";

export const PRODUCT_CREATE_REQUEST = "PRODUCT_CREATE_REQUEST";
export const PRODUCT_CREATE_SUCCESS = "PRODUCT_CREATE_SUCCESS";
export const PRODUCT_CREATE_FAIL = "PRODUCT_CREATE_FAIL";

export const PRODUCT_UPDATE_REQUEST = "PRODUCT_UPDATE_REQUEST";
export const PRODUCT_UPDATE_SUCCESS = "PRODUCT_UPDATE_SUCCESS";
export const PRODUCT_UPDATE_FAIL = "PRODUCT_UPDATE_FAIL";

export const PRODUCT_CREATE_REVIEW_REQUEST = "PRODUCT_CREATE_REVIEW_REQUEST";
export const PRODUCT_CREATE_REVIEW_SUCCESS = "PRODUCT_CREATE_REVIEW_SUCCESS";
export const PRODUCT_CREATE_REVIEW_FAIL = "PRODUCT_CREATE_REVIEW_FAIL";

export const PRODUCT_TOP_REQUEST = "PRODUCT_TOP_REQUEST";
export const PRODUCT_TOP_SUCCESS = "PRODUCT_TOP_SUCCESS";
export const PRODUCT_TOP_FAIL = "PRODUCT_TOP_FAIL";

// ----------------- ACTION CREATORS -----------------
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL

// List Products
export const listProducts = (keyword = "", pageNumber = "") => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_LIST_REQUEST });
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
    const { data } = await axios.get(`${API_URL}/api/products?keyword=${keyword}&pageNumber=${pageNumber}`, config);
    dispatch({ type: PRODUCT_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCT_LIST_FAIL,
      payload: error.response?.data.message || error.message,
    });
  }
};

// Product Details
export const listProductDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
    const { data } = await axios.get(`${API_URL}/api/products/${id}`, config);
    dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload: error.response?.data.message || error.message,
    });
  }
};

// Delete Product
export const deleteProduct = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_DELETE_REQUEST });
    const { userLogin: { userInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
    await axios.delete(`${API_URL}/api/products/${id}`, config);
    dispatch({ type: PRODUCT_DELETE_SUCCESS });
  } catch (error) {
    dispatch({ type: PRODUCT_DELETE_FAIL, payload: error.response?.data.message || error.message });
  }
};

// Create Product
export const createProduct = (product, imageFile) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_CREATE_REQUEST });
    //const { userLogin: { userInfo } } = getState();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    };
    const createdProduct = await axios.post(`${API_URL}/api/products/create`, product, config);

    let created = createdProduct;

    // 2) If we have an image file, upload it and then patch the product's image path
    if (createdProduct.status == 201 && imageFile) {
      const form = new FormData()
      form.append('image', imageFile)

      const uploadCfg = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }

      // Expect server to save into client/public/images and return path like "/images/<filename>"
      const { data: uploadedPath } = await axios.post(
        `${API_URL}/api/upload`,
        form,
        uploadCfg
      )

      // 3) Persist the new image path onto the product
      const { data: created2 } = await axios.put(
        `${API_URL}/api/products/${createdProduct.data._id}`,
        { ...product, image: uploadedPath?.file },
        config
      )

      created = created2
    }

    dispatch({ type: PRODUCT_CREATE_SUCCESS, payload: created });
  } catch (error) {
    dispatch({ type: PRODUCT_CREATE_FAIL, payload: error.response?.data.message || error.message });
  }
};

// Update Product
export const updateProduct = (product, imageFile) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_UPDATE_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const jsonCfg = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }

    // 1) Update base product fields
    const { data: updated1 } = await axios.put(
      `${API_URL}/api/products/${product._id}`,
      product,
      jsonCfg
    )

    let updated = updated1

    // 2) If we have an image file, upload it and then patch the product's image path
    if (imageFile) {
      const form = new FormData()
      form.append('image', imageFile)

      const uploadCfg = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }

      // Expect server to save into client/public/images and return path like "/images/<filename>"
      const { data: uploadedPath } = await axios.post(
        `${API_URL}/api/upload`,
        form,
        uploadCfg
      )

      // 3) Persist the new image path onto the product
      const { data: updated2 } = await axios.put(
        `${API_URL}/api/products/${product._id}`,
        { ...product, image: uploadedPath?.file },
        jsonCfg
      )

      updated = updated2
    }

    dispatch({ type: PRODUCT_UPDATE_SUCCESS, payload: updated })
  } catch (error) {
    dispatch({
      type: PRODUCT_UPDATE_FAIL,
      payload: error.response?.data.message || error.message,
    })
  }
}

// Create Product Review
export const createProductReview = (productId, review) => async (dispatch, getState) => {
  try {
    dispatch({ type: PRODUCT_CREATE_REVIEW_REQUEST });
    const { userLogin: { userInfo } } = getState();
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` } };
    await axios.post(`${API_URL}/api/products/${productId}/reviews`, review, config);
    dispatch({ type: PRODUCT_CREATE_REVIEW_SUCCESS });
  } catch (error) {
    dispatch({ type: PRODUCT_CREATE_REVIEW_FAIL, payload: error.response?.data.message || error.message });
  }
};

// List Top Products
export const listTopProducts = () => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_TOP_REQUEST });
    const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
    const { data } = await axios.get(`${API_URL}/api/products/top`, config);
    dispatch({ type: PRODUCT_TOP_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: PRODUCT_TOP_FAIL, payload: error.response?.data.message || error.message });
  }
};
