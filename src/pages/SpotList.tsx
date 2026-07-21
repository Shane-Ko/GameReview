import { useEffect, useState } from "react";
import type { Spot } from "../types";

export default function SpotList() {
  const [spots, setSpots] = useState<Spot[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/spots")
      .then(res => res.json())
      .then(data => {
        console.log("받아온 데이터:", data);
        setSpots(data);
      })
      .catch(err => console.error("에러:", err));
  }, []);

  return (
    <div>
      <h1>여행지 목록 ({spots.length}개)</h1>
      <ul>
        {spots.map(spot => (
          <li key={spot.id}>
            {spot.country} - {spot.description}
          </li>
        ))}
      </ul>
    </div>
  );
}