package com.admissionportal.service;

import com.admissionportal.entity.Application;
import com.admissionportal.entity.SeatReservation;

public interface SeatService {
    SeatReservation reserveSeat(Application application);
    void confirmSeat(Application application);
    void releaseSeat(Application application);
}
