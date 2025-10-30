package com.rngooglemapsplus.extensions

import com.google.android.gms.maps.model.JointType
import com.rngooglemapsplus.RNLineJoinType

fun RNLineJoinType?.toMapJointType(): Int =
  when (this) {
    RNLineJoinType.ROUND -> JointType.ROUND
    RNLineJoinType.BEVEL -> JointType.BEVEL
    RNLineJoinType.MITER -> JointType.DEFAULT
    null -> JointType.DEFAULT
  }
