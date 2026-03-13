/**
 * Author API Client
 */

import { apiClient } from "./api-client";
import type { AuthorDetail, AuthorDetailWithPapers } from "@/types/author.type";
import {
  type PaginatedData,
  type DeleteResponse,
  HttpStatus,
  ApiError,
} from "@/types/api.type";

const AUTHORS_BASE = "/api/v1/admin/authors";

export interface AuthorCreateRequest {
  name: string;
  displayName?: string;
  orcid?: string;
  openalexId?: string;
  url?: string;
  homepageUrl?: string;
}

export interface AuthorUpdateRequest {
  name?: string;
  displayName?: string;
  orcid?: string;
  openalexId?: string;
  url?: string;
  homepageUrl?: string;
  verified?: boolean;
}

export interface AuthorListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  verified?: boolean;
}

export interface AuthorStats {
  totalAuthors: number;
  verifiedAuthors: number;
  totalPapers: number;
  totalCitations: number;
}

export const authorApi = {
  /**
   * List all authors with pagination and filters
   */
  async list(
    params: AuthorListParams = {},
  ): Promise<PaginatedData<AuthorDetail>> {
    const { page = 1, pageSize = 20, search, verified } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) {
      queryParams.append("search", search);
    }

    if (verified !== undefined) {
      queryParams.append("verified", verified.toString());
    }

    const response = await apiClient.get<PaginatedData<AuthorDetail>>(
      `${AUTHORS_BASE}?${queryParams}`,
    );
    return response;
  },

  /**
   * Get a specific author by author_id
   */
  async get(authorId: string): Promise<AuthorDetail | null> {
    try {
      const response = await apiClient.get<AuthorDetail>(
        `${AUTHORS_BASE}/${authorId}`,
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.isStatus(HttpStatus.NOT_FOUND)) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get author details with papers, co-authors, and metrics
   */
  async getDetails(authorId: string): Promise<AuthorDetailWithPapers | null> {
    try {
      const response = await apiClient.get<AuthorDetailWithPapers>(
        `${AUTHORS_BASE}/${authorId}/details`,
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.isStatus(HttpStatus.NOT_FOUND)) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new author
   */
  async create(authorData: AuthorCreateRequest): Promise<AuthorDetail> {
    return await apiClient.post<AuthorDetail>(AUTHORS_BASE, authorData);
  },

  /**
   * Update an author's metadata
   */
  async update(
    authorId: string,
    updateData: AuthorUpdateRequest,
  ): Promise<AuthorDetail> {
    return await apiClient.patch<AuthorDetail>(
      `${AUTHORS_BASE}/${authorId}`,
      updateData,
    );
  },

  /**
   * Delete an author
   */
  async delete(authorId: string): Promise<DeleteResponse> {
    return await apiClient.delete<DeleteResponse>(
      `${AUTHORS_BASE}/${authorId}`,
    );
  },

  /**
   * Get author statistics
   */
  async getStats(): Promise<AuthorStats> {
    return await apiClient.get<AuthorStats>(`${AUTHORS_BASE}/stats`);
  },
};
