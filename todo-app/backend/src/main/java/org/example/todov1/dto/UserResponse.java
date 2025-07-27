package org.example.todov1.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {  // DTO 접미사 없이
    private Long id;
    private String username;
}

