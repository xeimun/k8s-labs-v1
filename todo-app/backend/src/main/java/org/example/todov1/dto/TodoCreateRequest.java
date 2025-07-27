package org.example.todov1.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TodoCreateRequest {
    private String title;
    private String description;
    private boolean completed;

    // Getters and Setters
}

