import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import PlaceList from '../components/PlaceList';
import { useHttpClient } from '../../shared/hooks/http-hook';

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const userId = useParams().userId;
  const {isLoading, error, sendRequest, clearError} = useHttpClient();

  useEffect(() => {   
    const fetchPlaces = async () =>{
      const responseData = await sendRequest(`http://localhost:5000/api/places/user/${userId}`); 
      console.log(error);
      setLoadedPlaces(responseData.places);
    }
    fetchPlaces();
  }, [sendRequest, userId]);

  const deletePlacehandler = (deleteId) =>{
    setLoadedPlaces(prevPlace => prevPlace.filter(place => place.id !== deleteId));
  }

  return (
    <>
    <ErrorModal error={error} onClear={clearError} />
    {isLoading && 
    <div className='center'>
      <LoadingSpinner />
    </div>}
    {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={deletePlacehandler} />}
    </>
  );
};

export default UserPlaces;
