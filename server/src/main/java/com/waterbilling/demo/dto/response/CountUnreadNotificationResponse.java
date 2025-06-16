package com.waterbilling.demo.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Builder
@Setter
@Getter
public class CountUnreadNotificationResponse {

    int count;
}
