import { useState, useEffect, useRef, useCallback } from "react";

export const useHttpClient = () =>{
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const activeHttpReqs = useRef([]); 

    const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) =>{
        setIsLoading(true);
        const httpAbortCtrl = new AbortController(); 
        activeHttpReqs.current.push(httpAbortCtrl); 

        const clearAbortController = () => {
            const index = activeHttpReqs.current.indexOf(httpAbortCtrl);
            if (index !== -1) {
                activeHttpReqs.current.splice(index, 1);
            }
        };
        setTimeout(clearAbortController, 4000);

        try {
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal,  
            });
            console.log(response);
            const responseData = await response.json();
            clearAbortController();   

            if(!response.ok){  
                throw new Error(responseData.message); 
            }
            setIsLoading(false);
            return responseData; 
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err; 
        }
        
    }, []);

    const clearError = () =>{
        setError(null);
    }

    useEffect(() => {
        return () => {activeHttpReqs.current.forEach(abortCtrl => abortCtrl.abort())}; 
    }, []);

    return {isLoading, error, sendRequest, clearError};
    
};
