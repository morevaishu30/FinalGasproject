package com.erp.accounting.controller;

import com.erp.accounting.model.Attachment;
import com.erp.accounting.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "*")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("referenceType") String referenceType,
            @RequestParam("referenceId") Long referenceId) {
        try {
            Attachment attachment = attachmentService.saveAttachment(file, referenceType, referenceId);
            return ResponseEntity.ok().body(Map.<String, Object>of("message", "File uploaded successfully", "id", attachment.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.<String, Object>of("message", "Could not upload the file: " + e.getMessage()));
        }
    }

    @GetMapping("/list/{referenceType}/{referenceId}")
    public ResponseEntity<List<Map<String, Object>>> getAttachments(
            @PathVariable String referenceType,
            @PathVariable Long referenceId) {
        List<Attachment> attachments = attachmentService.getAttachmentsByReference(referenceType, referenceId);
        List<Map<String, Object>> response = attachments.stream().map(att -> Map.<String, Object>of(
                "id", att.getId(),
                "fileName", att.getFileName(),
                "fileType", att.getFileType() != null ? att.getFileType() : ""
        )).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        Attachment attachment = attachmentService.getAttachment(id);
        if (attachment == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(attachment.getFileType() != null ? attachment.getFileType() : "application/octet-stream"))
                .body(attachment.getData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok().body(Map.<String, Object>of("message", "File deleted successfully"));
    }
}
