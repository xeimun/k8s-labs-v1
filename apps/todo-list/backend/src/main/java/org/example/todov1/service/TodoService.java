package org.example.todov1.service;

import org.example.todov1.dto.TodoCreateRequest;
import org.example.todov1.dto.TodoResponse;
import org.example.todov1.dto.UserResponse;
import org.example.todov1.entity.Todo;
import org.example.todov1.entity.User;
import org.example.todov1.repository.TodoRepository;
import org.example.todov1.security.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private UserService userService;

    // Todo 엔티티를 TodoResponse DTO로 변환하는 메서드
    public TodoResponse convertToResponse(Todo todo) {
        TodoResponse response = new TodoResponse();
        response.setId(todo.getId());
        response.setTitle(todo.getTitle());
        response.setDescription(todo.getDescription());
        response.setCompleted(todo.isCompleted());

        if (todo.getUser() != null) {
            UserResponse userResponse = new UserResponse();
            userResponse.setId(todo.getUser().getId());
            userResponse.setUsername(todo.getUser().getUsername());
            response.setUser(userResponse);
        }

        return response;
    }

    // 새로운 Todo 생성 후 TodoResponse DTO로 반환
    public TodoResponse createTodoForCurrentUser(TodoCreateRequest todoRequest) {
        Long userId = SecurityUtil.getCurrentUserId();
        User user = userService.getUserById(userId);
        Todo todo = new Todo();
        todo.setTitle(todoRequest.getTitle());
        todo.setDescription(todoRequest.getDescription());
        todo.setCompleted(todoRequest.isCompleted());
        todo.setUser(user);

        Todo savedTodo = todoRepository.save(todo);
        return convertToResponse(savedTodo);  // 저장된 엔티티를 DTO로 변환하여 반환
    }

    // 특정 사용자의 Todo 리스트를 DTO로 반환
    public List<TodoResponse> getTodosByUser(Long userId) {
        List<Todo> todos = todoRepository.findByUserId(userId);
        return todos.stream().map(this::convertToResponse).collect(Collectors.toList());  // 엔티티 리스트를 DTO 리스트로 변환
    }

    // Todo 업데이트 후 DTO로 반환
    public TodoResponse updateTodo(Long id, TodoCreateRequest newTodoData) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        todo.setTitle(newTodoData.getTitle());
        todo.setDescription(newTodoData.getDescription());
        todo.setCompleted(newTodoData.isCompleted());
        Todo updatedTodo = todoRepository.save(todo);
        return convertToResponse(updatedTodo);
    }

    // Todo 삭제
    public void deleteTodoById(Long id) {
        todoRepository.deleteById(id);
    }
}
