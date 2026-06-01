package com.erp.accounting.service;

import com.erp.accounting.model.Attachment;
import com.erp.accounting.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@Service
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    public Attachment saveAttachment(MultipartFile file, String referenceType, Long referenceId) throws IOException {
        Attachment attachment = new Attachment();
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(file.getContentType());
        attachment.setReferenceType(referenceType);
        attachment.setReferenceId(referenceId);
        attachment.setData(file.getBytes());
        return attachmentRepository.save(attachment);
    }

    public Attachment getAttachment(Long id) {
        return attachmentRepository.findById(id).orElse(null);
    }

    public List<Attachment> getAttachmentsByReference(String referenceType, Long referenceId) {
        return attachmentRepository.findByReferenceTypeAndReferenceId(referenceType, referenceId);
    }
    
    public void deleteAttachment(Long id) {
        attachmentRepository.deleteById(id);
    }
}
