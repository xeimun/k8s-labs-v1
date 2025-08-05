package org.example.todov1.controller;

import org.example.todov1.dto.TodoCreateRequest;
import org.example.todov1.dto.TodoResponse;
import org.example.todov1.security.SecurityUtil;
import org.example.todov1.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private TodoService todoService;

    // 사용자의 Todo 리스트를 DTO로 반환
    @GetMapping
    public ResponseEntity<List<TodoResponse>> getUserTodos() {
        Long userId = SecurityUtil.getCurrentUserId();  // 현재 사용자 ID 가져오기
        List<TodoResponse> todos = todoService.getTodosByUser(userId);  // 서비스 호출로 Todo 리스트 가져오기
        return new ResponseEntity<>(todos, HttpStatus.OK);  // DTO 리스트로 응답
    }

    // 새로운 Todo 생성 후 DTO로 반환
    @PostMapping
    public ResponseEntity<TodoResponse> createTodo(@RequestBody TodoCreateRequest todoRequest) {
        TodoResponse createdTodo = todoService.createTodoForCurrentUser(todoRequest);  // 서비스 호출로 Todo 생성
        return new ResponseEntity<>(createdTodo, HttpStatus.CREATED);  // 생성된 Todo를 DTO로 응답
    }

    // Todo 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponse> updateTodo(@PathVariable Long id, @RequestBody TodoCreateRequest newTodoData) {
        TodoResponse updatedTodo = todoService.updateTodo(id, newTodoData);
        return ResponseEntity.ok(updatedTodo);  // 업데이트된 Todo를 DTO로 응답
    }

    // Todo 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodoById(@PathVariable Long id) {
        todoService.deleteTodoById(id);
        return ResponseEntity.ok("Todo deleted successfully");
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong - CI/CD demo v1 ...";
    }
}

