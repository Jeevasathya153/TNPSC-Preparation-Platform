import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

/**
 * Custom hook for fetching data from API
 * Usage: const { data, loading, error } = useFetch('/endpoint');
 */
export const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(endpoint, options);
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch data');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint, options]);

  return { data, loading, error, refetch: () => {} };
};

/**
 * Custom hook for POST/PUT requests
 * Usage: const { mutate, loading, error } = useMutate();
 */
export const useMutate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (method, endpoint, payload = null) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (method === 'post') {
        response = await apiClient.post(endpoint, payload);
      } else if (method === 'put') {
        response = await apiClient.put(endpoint, payload);
      } else if (method === 'patch') {
        response = await apiClient.patch(endpoint, payload);
      } else if (method === 'delete') {
        response = await apiClient.delete(endpoint);
      }

      return response.data;
    } catch (err) {
      setError(err.message || 'Operation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
