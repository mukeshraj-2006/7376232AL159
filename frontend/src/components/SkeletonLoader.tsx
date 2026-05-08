/** SkeletonLoader — skeleton cards for loading state */

import React from "react";
import { Card, CardContent, Skeleton, Box } from "@mui/material";

interface Props { count?: number }

const SkeletonLoader: React.FC<Props> = React.memo(({ count = 5 }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} sx={{ opacity: 0.6 }}>
        <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Skeleton variant="rounded" width={70} height={24} />
              <Skeleton variant="rounded" width={50} height={20} />
            </Box>
            <Skeleton variant="text" width="90%" height={24} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="circular" width={32} height={32} />
        </CardContent>
      </Card>
    ))}
  </Box>
));

SkeletonLoader.displayName = "SkeletonLoader";
export default SkeletonLoader;
