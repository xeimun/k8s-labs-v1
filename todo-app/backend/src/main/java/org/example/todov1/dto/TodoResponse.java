package org.example.todov1.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TodoResponse {  // DTO 접미사 없이
    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private UserResponse user;  // 필요할 때만 포함
}

